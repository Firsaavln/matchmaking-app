import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { investorEmail, founderEmail, startupName, date, time, location } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'SIAP Jasatik <admin@siapjasatik.id>', // Ganti 'onboarding@resend.dev' dengan domain lu kalau sudah ada
      to: [investorEmail, founderEmail],
      subject: `🎉 Deal! Jadwal Meeting Match: ${startupName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #4f46e5;">Matchventure Deal!</h1>
          <p>Halo Bre, ada kabar gembira!</p>
          <p>Pertemuan antara Investor dan Startup <strong>${startupName}</strong> sudah disepakati.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Detail Jadwal:</strong></p>
          <ul>
            <li>Tanggal: ${date}</li>
            <li>Waktu: ${time}</li>
            <li>Lokasi/Link: ${location}</li>
          </ul>
          <p>Silakan cek dashboard lu buat detail lebih lanjut.</p>
          <p style="font-size: 12px; color: #999; margin-top: 40px;">© Matchventure Platform</p>
        </div>
      `,
    });

    if (error) return NextResponse.json({ error }, { status: 400 });

    return NextResponse.json({ message: 'Email terkirim!', data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}