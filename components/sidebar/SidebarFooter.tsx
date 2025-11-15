import LanguageSwitcher from "../language-switcher/LanguageSwitcher";

interface SheetFooterProps {}

export function SidebarFooter({}: SheetFooterProps) {
  return (
    <div className="flex flex-col">
      <LanguageSwitcher />
    </div>
  );
}
