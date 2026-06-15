import { useEffect } from "react";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - SnapOtter` : "SnapOtter";
    return () => {
      document.title = "SnapOtter";
    };
  }, [title]);
}
