import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { 
      investorEmail, 
      founderEmail,
      investorPhone, 
      founderPhone,  
      matchId,       
      startupName, 
      date, 
      time, 
      table 
    } = await req.json();

    // 1. GENERATE LINK MENUJU HALAMAN VERIFY
    const verifyLink = `https://siapjasatik.id/verify/${matchId || 'TBA'}`;

    // ==========================================
    // 2. KIRIM EMAIL VIA RESEND (DENGAN DESAIN & IKON KREATIF)
    // ==========================================
    const recipientEmails = [investorEmail, founderEmail].filter(Boolean);

    if (recipientEmails.length > 0) {
      const { error } = await resend.emails.send({
        from: 'SIAP Jasatik <admin@siapjasatik.id>', 
        to: recipientEmails,
        subject: `✨ DEAL MAKER! Jadwal Pertemuan Match: ${startupName} 🤝`,
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
                          <div style="font-size: 18px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #0f172a; font-style: italic;">
                              🚀 SIAP BUSINESS<span style="color: #4f46e5;">FORUM.</span>
                          </div>
                          <div style="height: 1px; width: 40px; background-color: #e2e8f0; margin-top: 20px;"></div>
                          </td>
                      </tr>

                      <tr>
                          <td style="padding: 0 40px 40px 40px;">
                          <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; text-align: center; margin: 0 0 10px 0; letter-spacing: -1px;">🌟 It's a Match!</h1>
                          <p style="font-size: 15px; color: #64748b; text-align: center; line-height: 1.6; margin: 0;">
                              Selamat Partner! Momen kolaborasi besar telah tiba. Jadwal pertemuan Anda untuk <strong>${startupName}</strong> telah resmi disepakati.
                          </p>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 35px; background-color: #f8fafc; border-radius: 24px; padding: 25px; border: 1px solid #f1f5f9;">
                              <tr>
                                  <td width="50%" style="padding-bottom: 20px;">
                                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tr>
                                              <td width="40" valign="middle">
                                                  <div style="width: 32px; height: 32px; background-color: #eef2ff; border-radius: 10px; text-align: center; line-height: 32px; font-size: 16px;">🗓️</div>
                                              </td>
                                              <td valign="middle">
                                                  <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 2px 0;">Tanggal</p>
                                                  <p style="font-size: 14px; font-weight: 800; color: #1e293b; margin: 0;">${date}</p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td width="50%" style="padding-bottom: 20px;">
                                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tr>
                                              <td width="40" valign="middle">
                                                  <div style="width: 32px; height: 32px; background-color: #fff7ed; border-radius: 10px; text-align: center; line-height: 32px; font-size: 16px;">⏳</div>
                                              </td>
                                              <td valign="middle">
                                                  <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 2px 0;">Waktu</p>
                                                  <p style="font-size: 14px; font-weight: 800; color: #1e293b; margin: 0;">${time} WIB</p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                              <tr>
                                  <td colspan="2" style="background-color: #ffffff; border-radius: 16px; padding: 15px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tr>
                                              <td width="50" valign="middle">
                                                  <div style="width: 40px; height: 40px; background-color: #4f46e5; border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">🎯</div>
                                              </td>
                                              <td valign="middle">
                                                  <p style="font-size: 10px; font-weight: 900; color: #818cf8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 2px 0;">Lokasi / Meja</p>
                                                  <p style="font-size: 18px; font-weight: 900; color: #312e81; margin: 0;">Table No. #${table}</p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>

                          <div style="margin-top: 30px; background-color: #ffffff; padding: 20px; border-left: 4px solid #4f46e5; border-radius: 0 16px 16px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                              <p style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">💡 Persiapan Kolaborasi:</p>
                              
                              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 8px;">
                                  <tr>
                                      <td width="24" valign="top" style="font-size: 14px;">✅</td>
                                      <td style="font-size: 13px; color: #475569; line-height: 1.5;">Hadir <strong>10 menit</strong> sebelum waktu yang ditentukan.</td>
                                  </tr>
                              </table>
                              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 8px;">
                                  <tr>
                                      <td width="24" valign="top" style="font-size: 14px;">💼</td>
                                      <td style="font-size: 13px; color: #475569; line-height: 1.5;">Bawa <strong>Pitch Deck</strong> atau portfolio terbaik Anda.</td>
                                  </tr>
                              </table>
                              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                      <td width="24" valign="top" style="font-size: 14px;">📱</td>
                                      <td style="font-size: 13px; color: #475569; line-height: 1.5;">Siapkan <strong>Tiket Digital</strong> Anda melalui tautan di bawah ini.</td>
                                  </tr>
                              </table>
                          </div>

                          <div style="margin-top: 35px; text-align: center; padding: 35px 20px; background-image: linear-gradient(to bottom right, #f8fafc, #f1f5f9); border: 2px dashed #cbd5e1; border-radius: 24px;">
                              <p style="font-size: 32px; margin: 0 0 10px 0;">🎟️</p>
                              <p style="font-size: 11px; font-weight: 900; color: #4f46e5; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0;">Exclusive Digital Pass</p>
                              <p style="font-size: 13px; color: #64748b; margin-bottom: 25px; px-4">Akses detail tiket digital dan QR Code Anda sebagai syarat Check-In acara.</p>
                              <a href="${verifyLink}" style="background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3);">⚡ Buka Tiket Saya</a>
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
        console.error("Resend Error Detail:", error); 
      }
    }

    // ==========================================
    // 3. KIRIM WHATSAPP VIA FONNTE (DENGAN COPYWRITING & IKON LEBIH MENARIK)
    // ==========================================
    const waMessage = `✨ *MATCH CONFIRMED!* ✨\n🏢 *SIAP BUSINESS FORUM*\n\n🎉 Selamat Partner, jadwal kolaborasi eksklusif Anda telah disepakati!\n\n🚀 *Startup:* ${startupName}\n🗓️ *Tanggal:* ${date}\n⏳ *Waktu:* ${time} WIB\n🎯 *Meja:* Table #${table}\n\n🎟️ *TIKET DIGITAL & QR CODE:*\nSilahkan klik tautan di bawah ini untuk melihat tiket masuk Anda:\n👉 ${verifyLink}\n\n💡 *Tips:* Jangan lupa bawa senyum dan _Pitch Deck_ terbaik Anda.\n\n👋 Sampai jumpa di meja kolaborasi! 📈`;

    const sendWA = async (phone: string) => {
      if (!phone || phone === 'TBA') return; 
      
      let cleanPhone = phone.replace(/\D/g, '');
      
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.slice(1);
      } else if (cleanPhone.startsWith('8')) {
        cleanPhone = '62' + cleanPhone;
      }

      try {
        const response = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': process.env.FONNTE_TOKEN || ''
          },
          body: new URLSearchParams({
            target: cleanPhone,
            message: waMessage,
          })
        });
        
        const result = await response.json();
        console.log(`[Fonnte Result] Kirim ke ${cleanPhone}:`, result);
      } catch (waErr) {
        console.error(`[Fonnte Error] Gagal kirim WA ke ${cleanPhone}:`, waErr);
      }
    };

    await Promise.all([
      sendWA(investorPhone),
      sendWA(founderPhone)
    ]);

    return NextResponse.json({ message: 'Email & WhatsApp sukses diproses!' });
  } catch (err: any) {
    console.error("Server Error:", err.message);
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}