import { NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET() {
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      const favicon: string | undefined = data?.data?.favicon;
      if (favicon) {
        return NextResponse.redirect(favicon, { status: 302 });
      }
    }
  } catch {
    // fall through to 204
  }
  return new NextResponse(null, { status: 204 });
}
