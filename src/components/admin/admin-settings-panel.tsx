"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Camera,
  CheckCircle2,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Moon,
  Save,
  Settings,
  Shield,
  Store,
  User,
} from "lucide-react";
import { PasswordField } from "@/components/common/password-field";
import { useScopedTheme } from "@/components/common/theme-provider";

type AdminSettingsUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type SettingsTab = "profile" | "store" | "notifications" | "security";

type Preferences = {
  darkMode: boolean;
  emailNotifications: boolean;
  twoFactor: boolean;
  orderAlerts: boolean;
  lowStockAlerts: boolean;
  maintenanceAlerts: boolean;
};

type ProfileForm = {
  name: string;
  bio: string;
};

type StoreForm = {
  storeName: string;
  email: string;
  phone: string;
  address: string;
};

type SecurityForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const SETTINGS_STORAGE_KEY = "hm-admin-settings";

const tabItems: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: User },
  { id: "store", label: "Cửa hàng", icon: Globe },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "security", label: "Bảo mật", icon: Shield },
];

const initialPreferences: Preferences = {
  darkMode: false,
  emailNotifications: true,
  twoFactor: false,
  orderAlerts: true,
  lowStockAlerts: true,
  maintenanceAlerts: false,
};

export function AdminSettingsPanel({ user }: { user: AdminSettingsUser }) {
  const { resolvedTheme, setScopedTheme } = useScopedTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<ProfileForm>({ name: user.name, bio: "" });
  const [store, setStore] = useState<StoreForm>({
    storeName: "TMDT Shop",
    email: "admin@tmdtshop.local",
    phone: "0900 000 000",
    address: "Thừa Thiên Huế",
  });
  const [security, setSecurity] = useState<SecurityForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<{
        profile: ProfileForm;
        store: StoreForm;
        preferences: Preferences;
        avatarPreview: string;
      }>;

      if (parsed.profile) setProfile((current) => ({ ...current, ...parsed.profile }));
      if (parsed.store) setStore((current) => ({ ...current, ...parsed.store }));
      if (parsed.preferences) setPreferences((current) => ({ ...current, ...parsed.preferences }));
      if (parsed.avatarPreview) setAvatarPreview(parsed.avatarPreview);
    } catch {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !resolvedTheme) return;
    setPreferences((current) => ({ ...current, darkMode: resolvedTheme === "dark" }));
  }, [mounted, resolvedTheme]);

  const currentTitle = useMemo(() => {
    return tabItems.find((tab) => tab.id === activeTab)?.label ?? "Hồ sơ cá nhân";
  }, [activeTab]);

  function persistSettings(message: string) {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ profile, store, preferences, avatarPreview }),
    );
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(""), 2600);
  }

  function togglePreference(key: keyof Preferences) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleDarkMode() {
    const nextDarkMode = resolvedTheme !== "dark";
    setScopedTheme(nextDarkMode ? "dark" : "light");
    setPreferences((current) => ({ ...current, darkMode: nextDarkMode }));
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
        setStatusMessage("Ảnh đại diện đã được chọn. Bấm Lưu để ghi nhớ.");
      }
    };
    reader.readAsDataURL(file);
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persistSettings("Đã lưu hồ sơ cá nhân.");
  }

  function saveStore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persistSettings("Đã lưu thông tin cửa hàng.");
  }

  function saveNotifications() {
    persistSettings("Đã lưu tùy chọn thông báo.");
  }

  function saveSecurity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (security.newPassword && security.newPassword !== security.confirmPassword) {
      setStatusMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    persistSettings("Đã cập nhật tùy chọn bảo mật.");
  }

  return (
    <div className="space-y-12">
      <header>
        <p className="hm-kicker">Hệ thống</p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h1 className="hm-page-title">Cài đặt</h1>
          {statusMessage && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-sage/20 bg-sage/10 px-4 py-3 text-xs font-bold text-sage">
              <CheckCircle2 size={16} />
              {statusMessage}
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0" aria-label="Cài đặt quản trị">
          {tabItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-pressed={activeTab === item.id}
              className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all lg:w-full lg:gap-4 lg:px-6 lg:py-4 ${
                activeTab === item.id
                  ? "bg-ink text-ivory shadow-lg shadow-ink/20"
                  : "text-ink/40 hover:bg-porcelain hover:text-ink dark:text-ivory/55 dark:hover:bg-white/10 dark:hover:text-ivory"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-8 lg:col-span-2">
          <section className="hm-surface overflow-hidden">
            <div className="border-b border-ink/5 bg-porcelain/50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:px-8 sm:py-6">
              <h2 className="flex items-center gap-3 font-serif text-2xl">
                {activeTab === "profile" && <User size={24} className="text-sage" />}
                {activeTab === "store" && <Store size={24} className="text-copper" />}
                {activeTab === "notifications" && <Bell size={24} className="text-sage" />}
                {activeTab === "security" && <Shield size={24} className="text-copper" />}
                {currentTitle}
              </h2>
            </div>

            {activeTab === "profile" && (
              <div className="p-5 sm:p-8">
                <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                  <div className="group relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-tr from-sage to-copper text-3xl font-bold text-white shadow-xl">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt={profile.name} className="h-full w-full object-cover" />
                    ) : (
                      profile.name.charAt(0)
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Đổi ảnh đại diện"
                    >
                      <Camera size={24} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl">{profile.name}</h3>
                    <p className="mt-1 text-sm font-bold uppercase tracking-widest text-copper">{user.role}</p>
                    <p className="mt-1 text-xs text-ink/40 dark:text-ivory/55">ID Quản trị: #ADM-{user.id}</p>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Họ và tên</span>
                      <input
                        value={profile.name}
                        onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                        className="hm-field w-full"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Email</span>
                      <input disabled value={user.email} className="hm-field w-full cursor-not-allowed opacity-50" />
                    </label>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Giới thiệu ngắn</span>
                    <textarea
                      value={profile.bio}
                      onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
                      placeholder="Viết gì đó về bạn..."
                      className="hm-field h-32 w-full resize-none py-4"
                    />
                  </label>
                  <div className="flex justify-end pt-4">
                    <button className="hm-btn-primary w-full sm:w-auto">
                      <Save size={18} />
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "store" && (
              <form onSubmit={saveStore} className="grid gap-6 p-5 sm:p-8 md:grid-cols-2">
                <Field label="Tên cửa hàng" value={store.storeName} onChange={(value) => setStore((current) => ({ ...current, storeName: value }))} />
                <Field label="Email liên hệ" type="email" value={store.email} onChange={(value) => setStore((current) => ({ ...current, email: value }))} />
                <Field label="Số điện thoại" value={store.phone} onChange={(value) => setStore((current) => ({ ...current, phone: value }))} />
                <label className="space-y-2 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Địa chỉ cửa hàng</span>
                  <textarea
                    value={store.address}
                    onChange={(event) => setStore((current) => ({ ...current, address: event.target.value }))}
                    className="hm-field h-28 w-full resize-none py-4"
                  />
                </label>
                <div className="flex justify-end border-t border-ink/5 pt-6 dark:border-white/10 md:col-span-2">
                  <button className="hm-btn-primary w-full sm:w-auto">
                    <Save size={18} />
                    Lưu cửa hàng
                  </button>
                </div>
              </form>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 p-5 sm:p-8">
                <PreferenceSwitch
                  icon={Mail}
                  label="Thông báo Email"
                  desc="Nhận thông báo về đơn hàng mới qua email."
                  enabled={preferences.emailNotifications}
                  onToggle={() => togglePreference("emailNotifications")}
                />
                <PreferenceSwitch
                  icon={Bell}
                  label="Đơn hàng mới"
                  desc="Hiển thị cảnh báo khi khách đặt đơn hàng mới."
                  enabled={preferences.orderAlerts}
                  onToggle={() => togglePreference("orderAlerts")}
                />
                <PreferenceSwitch
                  icon={Store}
                  label="Cảnh báo tồn kho thấp"
                  desc="Nhắc đội vận hành khi sản phẩm sắp hết hàng."
                  enabled={preferences.lowStockAlerts}
                  onToggle={() => togglePreference("lowStockAlerts")}
                />
                <PreferenceSwitch
                  icon={Settings}
                  label="Thông báo bảo trì"
                  desc="Nhận cập nhật khi hệ thống có lịch bảo trì."
                  enabled={preferences.maintenanceAlerts}
                  onToggle={() => togglePreference("maintenanceAlerts")}
                />
                <div className="flex justify-end border-t border-ink/5 pt-6 dark:border-white/10">
                  <button type="button" onClick={saveNotifications} className="hm-btn-primary w-full sm:w-auto">
                    <Save size={18} />
                    Lưu thông báo
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <form onSubmit={saveSecurity} className="space-y-6 p-5 sm:p-8">
                <PreferenceSwitch
                  icon={Moon}
                  label="Chế độ tối"
                  desc="Chuyển giao diện quản trị sang tông màu tối."
                  enabled={mounted ? resolvedTheme === "dark" : preferences.darkMode}
                  onToggle={toggleDarkMode}
                />
                <PreferenceSwitch
                  icon={KeyRound}
                  label="Xác thực 2 lớp"
                  desc="Bật lớp xác thực bổ sung cho tài khoản quản trị."
                  enabled={preferences.twoFactor}
                  onToggle={() => togglePreference("twoFactor")}
                />
                <div className="grid gap-6 border-t border-ink/5 pt-8 dark:border-white/10 md:grid-cols-3">
                  <Field
                    label="Mật khẩu hiện tại"
                    type="password"
                    value={security.currentPassword}
                    onChange={(value) => setSecurity((current) => ({ ...current, currentPassword: value }))}
                  />
                  <Field
                    label="Mật khẩu mới"
                    type="password"
                    value={security.newPassword}
                    onChange={(value) => setSecurity((current) => ({ ...current, newPassword: value }))}
                  />
                  <Field
                    label="Xác nhận mật khẩu"
                    type="password"
                    value={security.confirmPassword}
                    onChange={(value) => setSecurity((current) => ({ ...current, confirmPassword: value }))}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button className="hm-btn-primary w-full sm:w-auto">
                    <Lock size={18} />
                    Cập nhật bảo mật
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">{label}</span>
      {type === "password" ? (
        <PasswordField value={value} onChange={(event) => onChange(event.target.value)} inputClassName="hm-field w-full" />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="hm-field w-full" />
      )}
    </label>
  );
}

function PreferenceSwitch({
  icon: Icon,
  label,
  desc,
  enabled,
  onToggle,
}: {
  icon: typeof Bell;
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-ink/5 py-4 first:pt-0 last:border-0 last:pb-0 dark:border-white/10 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex items-start gap-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-porcelain text-ink/45 dark:bg-white/10 dark:text-ivory/60">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-bold">{label}</p>
          <p className="mt-1 text-xs text-ink/40 dark:text-ivory/60">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? "bg-sage" : "bg-ink/10"}`}
      >
        <span className={`absolute left-1 top-1 size-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
