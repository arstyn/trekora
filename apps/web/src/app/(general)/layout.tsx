import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
