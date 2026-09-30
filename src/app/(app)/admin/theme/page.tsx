import { buildMetadata } from "@/lib/seo";
import { DEFAULT_FONTS, DEFAULT_LAYOUT, LAYOUT_LIMITS, THEME_PRESETS, THEME_TOKENS } from "@/lib/theme";
import { getThemeSettings } from "@/repositories/siteSettings";
import AdminThemePage from "@/views/AdminThemePage";

export const metadata = buildMetadata({ title: "Apparence (admin)", path: "/admin/theme", noIndex: true });

export default async function Page() {
  const settings = await getThemeSettings();
  const tokens = THEME_TOKENS.map((item) => ({ key: item.key, group: item.group, default: item.default, value: settings.colors[item.key] ?? item.default }));
  return (
    <AdminThemePage
      tokens={tokens}
      presets={THEME_PRESETS}
      initialFonts={{ ...DEFAULT_FONTS, ...settings.fonts }}
      initialLayout={{ ...DEFAULT_LAYOUT, ...settings.layout }}
      initialPolicy={settings.policy}
      initialCustomFonts={settings.customFonts}
      layoutLimits={LAYOUT_LIMITS}
    />
  );
}
