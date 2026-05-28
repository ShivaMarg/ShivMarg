"""
email_utils.py — ShivaMarg Email Utility
Supports two providers:
  - Resend API  (recommended, set EMAIL_PROVIDER=resend)
  - Gmail SMTP  (fallback,    set EMAIL_PROVIDER=gmail)

Add to .env:
  EMAIL_PROVIDER=resend         # or 'gmail'
  # --- For Resend ---
  RESEND_API_KEY=re_xxxxxxxxxxxx
  EMAIL_FROM=ShivaMarg <noreply@yourdomain.com>
  # --- For Gmail SMTP ---
  ZOHO_EMAIL=your@gmail.com
  ZOHO_PASSWORD=xxxx xxxx xxxx xxxx
  EMAIL_FROM_NAME=ShivaMarg
"""

import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text      import MIMEText
from datetime             import datetime

logger = logging.getLogger("shivamarg.email")

# ─────────────────────────────────────────────
#  CONFIG  (read from environment)
# ─────────────────────────────────────────────
EMAIL_PROVIDER     = os.getenv("EMAIL_PROVIDER",     "zoho").lower()  # 'resend' | 'zoho'
EMAIL_FROM         = os.getenv("EMAIL_FROM",         "ShivaMarg <noreply@shivamarg.com>")
EMAIL_FROM_NAME    = os.getenv("EMAIL_FROM_NAME",    "ShivaMarg")

# Resend
RESEND_API_KEY     = os.getenv("RESEND_API_KEY",     "")

# Zoho SMTP
ZOHO_EMAIL         = os.getenv("ZOHO_EMAIL",         "")
ZOHO_PASSWORD = os.getenv("ZOHO_PASSWORD", "")

# ─────────────────────────────────────────────
#  HTML EMAIL TEMPLATE
# ─────────────────────────────────────────────
def _build_welcome_html(display_name: str, username: str) -> str:
    """
    Returns a clean, responsive HTML welcome email.
    Uses inline CSS for maximum email-client compatibility.
    """
    year = datetime.utcnow().year
    return f"""<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShivaMarg में आपका स्वागत है</title>
</head>
<body style="margin:0;padding:0;background-color:#fdf6ec;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#fdf6ec;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background:#ffffff;border-radius:16px;
                      overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#b5451b 0%,#e07b39 100%);
                        padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;
                          letter-spacing:1px;">🕉 ShivaMarg</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;
                         letter-spacing:2px;text-transform:uppercase;">
                आध्यात्मिक ज्ञान का मार्ग
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 32px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 8px;color:#2d1a0e;font-size:24px;font-weight:700;">
                नमस्ते, {display_name}! 🙏
              </h2>
              <p style="margin:0 0 24px;color:#b5451b;font-size:14px;font-weight:600;
                          letter-spacing:1px;">
                @{username}
              </p>

              <p style="margin:0 0 20px;color:#4a3728;font-size:16px;line-height:1.7;">
                ShivaMarg परिवार में आपका हार्दिक स्वागत है।
                हमें प्रसन्नता है कि आप इस आध्यात्मिक यात्रा का हिस्सा बने।
              </p>

              <p style="margin:0 0 28px;color:#4a3728;font-size:15px;line-height:1.7;">
                ShivaMarg पर आप पाएंगे —
              </p>

              <!-- Feature list -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="margin-bottom:28px;">
                <tr>
                  <td style="padding:10px 16px;background:#fdf6ec;border-radius:8px;
                              margin-bottom:8px;border-left:4px solid #b5451b;">
                    <span style="font-size:20px;">📿</span>
                    <span style="color:#2d1a0e;font-size:15px;margin-left:10px;font-weight:600;">
                      वैदिक मंत्र एवं स्तोत्र
                    </span>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:10px 16px;background:#fdf6ec;border-radius:8px;
                              border-left:4px solid #e07b39;">
                    <span style="font-size:20px;">📖</span>
                    <span style="color:#2d1a0e;font-size:15px;margin-left:10px;font-weight:600;">
                      विद्यापति गीत संग्रह
                    </span>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:10px 16px;background:#fdf6ec;border-radius:8px;
                              border-left:4px solid #d4a843;">
                    <span style="font-size:20px;">✍️</span>
                    <span style="color:#2d1a0e;font-size:15px;margin-left:10px;font-weight:600;">
                      लेख एवं आध्यात्मिक ज्ञान
                    </span>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:10px 16px;background:#fdf6ec;border-radius:8px;
                              border-left:4px solid #7c6b4e;">
                    <span style="font-size:20px;">💬</span>
                    <span style="color:#2d1a0e;font-size:15px;margin-left:10px;font-weight:600;">
                      समुदाय के साथ संवाद
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0e6d3;margin:0 0 28px;">

              <!-- Become a Lekhak callout -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:linear-gradient(135deg,#fdf0e0,#fde8cc);
                             border-radius:12px;padding:24px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 8px;font-size:18px;color:#2d1a0e;font-weight:700;">
                      ✨ लेखक बनें — लेखक बनें!
                    </p>
                    <p style="margin:0;color:#5c3d2e;font-size:14px;line-height:1.6;">
                      अपना ज्ञान और विचार हजारों पाठकों तक पहुँचाएं।
                      ShivaMarg पर लेखक (Lekhak) के रूप में अपनी आध्यात्मिक यात्रा
                      शुरू करें।
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#7c6b4e;font-size:13px;line-height:1.6;">
                यह एक स्वचालित संदेश है। कृपया इसका उत्तर न दें।<br>
                किसी सहायता के लिए हमसे संपर्क करें।
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#2d1a0e;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#e07b39;font-size:16px;font-weight:700;">
                🕉 ShivaMarg
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">
                © {year} ShivaMarg. सर्वाधिकार सुरक्षित।
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>"""


def _build_welcome_text(display_name: str, username: str) -> str:
    """Plain-text fallback for email clients that don't render HTML."""
    return f"""नमस्ते {display_name} (@{username}),

ShivaMarg परिवार में आपका हार्दिक स्वागत है! 🙏

ShivaMarg पर आप पाएंगे:
  - वैदिक मंत्र एवं स्तोत्र
  - विद्यापति गीत संग्रह
  - लेख एवं आध्यात्मिक ज्ञान
  - समुदाय के साथ संवाद

आध्यात्मिक यात्रा में आपका स्वागत है।

— ShivaMarg Team
"""


# ─────────────────────────────────────────────
#  SENDER IMPLEMENTATIONS
# ─────────────────────────────────────────────

def _send_via_resend(to_email: str, display_name: str, username: str) -> bool:
    """
    Send using Resend API.
    Requires:  pip install resend
    Free tier: 3,000 emails/month, no credit card needed.
    """
    try:
        import resend  # type: ignore
        resend.api_key = RESEND_API_KEY

        params = {
            "from":    EMAIL_FROM,
            "to":      [to_email],
            "subject": f"🕉 ShivaMarg में आपका स्वागत है, {display_name}!",
            "html":    _build_welcome_html(display_name, username),
            "text":    _build_welcome_text(display_name, username),
        }
        response = resend.Emails.send(params)
        logger.info(f"[Resend] Welcome email sent to {to_email} | id={response.get('id')}")
        return True

    except ImportError:
        logger.error("[Resend] Package not installed. Run: pip install resend")
        return False
    except Exception as e:
        logger.error(f"[Resend] Failed to send to {to_email}: {e}")
        return False


def _send_via_zoho(to_email: str, display_name: str, username: str) -> bool:

    try:
        msg = MIMEMultipart("alternative")

        msg["Subject"] = f"🕉 ShivaMarg में आपका स्वागत है, {display_name}!"
        msg["From"] = f"{EMAIL_FROM_NAME} <{ZOHO_EMAIL}>"
        msg["To"] = to_email

        msg.attach(
            MIMEText(
                _build_welcome_text(display_name, username),
                "plain",
                "utf-8"
            )
        )

        msg.attach(
            MIMEText(
                _build_welcome_html(display_name, username),
                "html",
                "utf-8"
            )
        )

        # SSL METHOD
        with smtplib.SMTP_SSL(
            "smtp.zoho.in",
            465,
            timeout=30
        ) as server:

            server.login(
                ZOHO_EMAIL,
                ZOHO_PASSWORD
            )

            server.sendmail(
                ZOHO_EMAIL,
                to_email,
                msg.as_string()
            )

        logger.info(f"[ZOHO SMTP] Welcome email sent to {to_email}")

        return True

    except smtplib.SMTPAuthenticationError as e:

        logger.error(f"[ZOHO SMTP] Authentication failed: {e}")

        return False

    except Exception as e:

        logger.error(f"[ZOHO SMTP] Failed to send email: {e}")

        return False

# ─────────────────────────────────────────────
#  PUBLIC API  — the only function you import
# ─────────────────────────────────────────────

def send_welcome_email(to_email: str, display_name: str, username: str) -> bool:
    """
    Unified entry point. Picks provider based on EMAIL_PROVIDER env var.
    Returns True on success, False on failure (never raises — safe to call
    from a background task without crashing the registration response).

    Usage:
        from email_utils import send_welcome_email
        send_welcome_email(user_email, display_name, username)
    """
    if not to_email:
        logger.warning("send_welcome_email called with empty email — skipping")
        return False

    if EMAIL_PROVIDER == "resend":
        return _send_via_resend(to_email, display_name, username)
    else:
        return _send_via_zoho(to_email, display_name, username)
