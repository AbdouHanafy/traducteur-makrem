import { buildMetadata } from "@/lib/seo";
import { THEME_TOKENS } from "@/lib/theme";
import { getThemeOverrides } from "@/repositories/siteSettings";
import AdminThemePage from "@/views/AdminThemePage";

export const metadata = buildMetadata({ title: "Apparence (admin)", path: "/admin/theme", noIndex: true });

export default async function Page() {
  const overrides = await getThemeOverrides();
  const tokens = THEME_TOKENS.map((token) => ({ key: token.key, label: token.label, hint: token.hint, default: token.default, value: overrides[token.key] ?? token.default }));
  return <AdminThemePage tokens={tokens} />;
}
