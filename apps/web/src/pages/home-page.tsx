import { AppLayout } from "@/components/layout/app-layout";
import { usePageTitle } from "@/hooks/use-page-title";

export function HomePage() {
  usePageTitle();

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Tool browser coming soon (Task 6)</p>
      </div>
    </AppLayout>
  );
}
