import { redirect } from 'next/navigation';

export default function RootPage() {
  // สั่งให้หน้าแรกเด้งไปที่ /login ทันทีที่เปิดเว็บ
  redirect('/login');
}