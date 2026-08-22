import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import pool from "../config/db.js";
import sendEmail from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, avatar_url, created_at
      `,
            [name.trim(), normalizedEmail, hashedPassword]
        );

        const user = result.rows[0];

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user,
        });
    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while creating your account.",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const user = result.rows[0];

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message:
                    "This account uses Google login. Please continue with Google.",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while logging in.",
        });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: "Google access token is required.",
            });
        }

        const googleResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!googleResponse.ok) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google access token.",
            });
        }

        const googleUser = await googleResponse.json();

        const {
            sub: googleId,
            email,
            name,
            picture,
            email_verified: emailVerified,
        } = googleUser;

        if (!email || !emailVerified) {
            return res.status(400).json({
                success: false,
                message: "Google email could not be verified.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [normalizedEmail]
        );

        let user;

        if (existingUser.rows.length > 0) {
            user = existingUser.rows[0];

            await pool.query(
                `
                UPDATE users
                SET google_id = $1,
                    avatar_url = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                `,
                [googleId, picture || null, user.id]
            );

            user = {
                ...user,
                google_id: googleId,
                avatar_url: picture || null,
            };
        } else {
            const result = await pool.query(
                `
                INSERT INTO users
                (name, email, google_id, avatar_url)
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, email, google_id, avatar_url, created_at
                `,
                [
                    name || "ZENOVA User",
                    normalizedEmail,
                    googleId,
                    picture || null,
                ]
            );

            user = result.rows[0];
        }

        const token = generateToken(user);

        return res.json({
            success: true,
            message: "Google login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
            },
        });
    } catch (error) {
        console.error("Google login error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during Google login.",
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(
            `
      SELECT id, name, email, avatar_url, created_at
      FROM users
      WHERE id = $1
      `,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.json({
            success: true,
            user: result.rows[0],
        });
    } catch (error) {
        console.error("Get current user error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get current user.",
        });
    }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `
            SELECT id, name, email, password
            FROM users
            WHERE email = $1
            `,
            [normalizedEmail],
        );

        // Don't reveal whether an email exists.
        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists with that email, a password reset link has been sent.",
            });
        }

        const user = result.rows[0];

        // JWT reset token - expires in 15 minutes
        const resetToken = jwt.sign(
            {
                id: user.id,
                purpose: "password-reset",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m",
            },
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Reset your ZENOVA password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px 20px; color: #302923;">
                    <h1 style="font-weight: 400; letter-spacing: 2px;">
                        ZENOVA
                    </h1>

                    <h2 style="font-weight: 400;">
                        Reset your password
                    </h2>

                    <p>
                        Hello ${user.name},
                    </p>

                    <p>
                        We received a request to reset your ZENOVA account password.
                    </p>

                    <a
                        href="${resetLink}"
                        style="
                            display: inline-block;
                            margin: 20px 0;
                            padding: 14px 24px;
                            background: #241c18;
                            color: white;
                            text-decoration: none;
                        "
                    >
                        Reset Password
                    </a>

                    <p>
                        This link will expire in 15 minutes.
                    </p>

                    <p style="color: #81776e;">
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>

                    <p>
                        — ZENOVA
                    </p>
                </div>
            `,
        });

        return res.status(200).json({
            success: true,
            message:
                "password reset link has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process password reset request.",
        });
    }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters.",
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired.",
            });
        }

        if (decoded.purpose !== "password-reset") {
            return res.status(400).json({
                success: false,
                message: "Invalid password reset token.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            UPDATE users
            SET password = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, name, email, avatar_url, created_at
            `,
            [hashedPassword, decoded.id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });
    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reset password.",
        });
    }
};