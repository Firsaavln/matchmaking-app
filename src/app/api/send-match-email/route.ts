import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 1. TAMBAHKAN 'table' di sini (tadi lu tulis 'location')
    const { 
      investorEmail, 
      founderEmail, 
      startupName, 
      date, 
      time, 
      table 
    } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'SIAP Jasatik <admin@siapjasatik.id>', 
      to: [investorEmail, founderEmail],
      subject: `🎉 Deal! Jadwal Meeting Match: ${startupName}`,
      html: `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                        <div style="font-size: 20px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; color: #0f172a; font-style: italic;">
                            SIAP BUSINESS<span style="color: #4f46e5;">FORUM.</span>
                        </div>
                        <div style="height: 1px; width: 40px; background-color: #e2e8f0; margin-top: 20px;"></div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                        <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; text-align: center; margin: 0 0 10px 0; letter-spacing: -0.5px;">It's a Match!</h1>
                        <p style="font-size: 16px; color: #64748b; text-align: center; line-height: 1.6; margin: 0;">
                            Halo Partner, momen kolaborasi besar telah tiba. Jadwal pertemuan Anda untuk <strong>${startupName}</strong> telah resmi disepakati.
                        </p>

                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 35px; background-color: #f1f5f9; border-radius: 24px; padding: 30px;">
                            <tr>
                            <td>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td width="50%" style="padding-bottom: 25px;">
                                    <p style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">📅 Tanggal</p>
                                    <p style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0;">${date}</p>
                                    </td>
                                    <td width="50%" style="padding-bottom: 25px;">
                                    <p style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">⏰ Waktu</p>
                                    <p style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0;">${time} WIB</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="background-color: #ffffff; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                        <td>
                                            <p style="font-size: 11px; font-weight: 900; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">📍 Lokasi / Meja</p>
                                            <p style="font-size: 20px; font-weight: 900; color: #4f46e5; margin: 0;">Table No. #${table}</p>
                                        </td>
                                        <td align="right">
                                            <div style="width: 40px; height: 40px; background-color: #eef2ff; border-radius: 12px; text-align: center; line-height: 40px;">☕</div>
                                        </td>
                                        </tr>
                                    </table>
                                    </td>
                                </tr>
                                </table>
                            </td>
                            </tr>
                        </table>

                        <div style="margin-top: 30px; border-left: 4px solid #4f46e5; padding-left: 20px;">
                            <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 5px 0;">Persiapan Pertemuan:</p>
                            <ul style="font-size: 13px; color: #64748b; margin: 0; padding-left: 18px; line-height: 1.8;">
                            <li>Harap hadir 10 menit sebelum waktu yang ditentukan.</li>
                            <li>Bawa Pitch Deck atau Portfolio terbaru Anda.</li>
                            <li>Siapkan mental dan energi terbaik untuk kolaborasi!</li>
                            </ul>
                        </div>

                        <div style="margin-top: 40px; text-align: center;">
                            <a href="https://siapjasatik.id/dashboard" style="background-color: #0f172a; color: #ffffff; padding: 18px 35px; border-radius: 16px; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Lihat Detail di Dashboard</a>
                        </div>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
                            © 2026 Powered by EKRAF & PT. PANCA CENTRAL ABADI
                        </p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
            </body>
            </html>
      `,
    });

    if (error) {
      console.error("Resend Error Detail:", error); // Biar gampang debug kalau ada error lagi
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email terkirim!', data });
  } catch (err: any) {
    console.error("Server Error:", err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}