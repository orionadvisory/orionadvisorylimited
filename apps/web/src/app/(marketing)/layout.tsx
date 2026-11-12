import { SmoothScroll } from "@/components/marketing/motion/smooth-scroll";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import "./marketing.css";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <div className="marketing-page">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </SmoothScroll>
  );
}
