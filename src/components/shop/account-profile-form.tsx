"use client";

import { FormEvent, useState } from "react";
import { Check, Edit3, ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

type AccountProfileFormProps = {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
    phone: string | null;
    address: string | null;
  };
};

function AvatarPreview({ avatarUrl, initial, label, size = "large" }: { avatarUrl: string; initial: string; label: string; size?: "large" | "small" }) {
  return (
    <div
      aria-label={label}
      role={avatarUrl ? "img" : undefined}
      className={`${size === "large" ? "size-28 text-4xl" : "size-24 text-3xl"} grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-tr from-sage to-copper bg-cover bg-center font-bold text-white shadow-soft`}
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
    >
      {avatarUrl ? null : <span>{initial}</span>}
    </div>
  );
}

export function AccountProfileForm({ user }: AccountProfileFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: user.name,
    avatarUrl: user.avatarUrl ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
  });
  const avatarInitial = form.name.trim().charAt(0).toUpperCase() || "H";

  function resetForm() {
    setForm({
      name: user.name,
      avatarUrl: user.avatarUrl ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
    });
    setError("");
    setSuccess("");
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const avatarUrl = form.avatarUrl.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();

    if (name.length < 2) {
      setError("Vui lòng nhập họ tên có ít nhất 2 ký tự.");
      return;
    }

    if (phone && !/^[0-9+\-\s().]{8,20}$/.test(phone)) {
      setError("Số điện thoại chưa đúng định dạng.");
      return;
    }

    if (address && address.length < 5) {
      setError("Địa chỉ cần rõ hơn để giao hàng chính xác.");
      return;
    }

    setIsSaving(true);
    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatarUrl, phone, address }),
    });
    const data = await response.json().catch(() => ({}));
    setIsSaving(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể cập nhật hồ sơ.");
      return;
    }

    setForm({
      name: data.user.name,
      avatarUrl: data.user.avatarUrl ?? "",
      phone: data.user.phone ?? "",
      address: data.user.address ?? "",
    });
    setSuccess("Đã lưu thông tin hồ sơ.");
    setIsEditing(false);
    router.refresh();
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setSuccess("");
    setIsUploadingAvatar(true);

    const uploadData = new FormData();
    uploadData.append("avatar", file);

    const response = await fetch("/api/account/avatar", {
      method: "POST",
      body: uploadData,
    });
    const data = await response.json().catch(() => ({}));
    setIsUploadingAvatar(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể tải ảnh đại diện.");
      return;
    }

    setForm((current) => ({ ...current, avatarUrl: data.avatarUrl ?? current.avatarUrl }));
    setSuccess("Đã tải ảnh đại diện. Hồ sơ đã được cập nhật.");
    router.refresh();
  }

  return (
    <section className="hm-surface p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-copper">Hồ sơ khách hàng</p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Thông tin cá nhân</h2>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => {
              setSuccess("");
              setIsEditing(true);
            }}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-ink/10 bg-white text-ink/60 transition-all hover:border-copper hover:bg-copper hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-ivory/70"
            aria-label="Chỉnh sửa hồ sơ"
            title="Chỉnh sửa hồ sơ"
          >
            <Edit3 size={16} />
          </button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[180px_1fr]">
          <div className="rounded-2xl border border-ink/5 bg-porcelain/60 p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex justify-center">
              <AvatarPreview avatarUrl={form.avatarUrl} initial={avatarInitial} label={`Ảnh đại diện của ${form.name}`} />
            </div>
            <p className="mt-4 break-words text-sm font-bold text-ink dark:text-ivory">{form.name}</p>
            <p className="mt-1 break-all text-xs text-ink/45 dark:text-ivory/55">{user.email}</p>
          </div>

          <div className="grid gap-3 text-sm text-ink/70 dark:text-ivory/70 sm:grid-cols-2">
            <p className="rounded-2xl border border-ink/5 p-4 dark:border-white/10">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/50">Họ tên</span>
              <span className="mt-2 block font-semibold text-ink dark:text-ivory">{form.name}</span>
            </p>
            <p className="rounded-2xl border border-ink/5 p-4 dark:border-white/10">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/50">Email</span>
              <span className="mt-2 block break-all font-semibold text-ink dark:text-ivory">{user.email}</span>
            </p>
            <p className="rounded-2xl border border-ink/5 p-4 dark:border-white/10">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/50">Số điện thoại</span>
              <span className="mt-2 block font-semibold text-ink dark:text-ivory">{form.phone || "Chưa cập nhật"}</span>
            </p>
            <p className="rounded-2xl border border-ink/5 p-4 dark:border-white/10">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/50">Ảnh đại diện</span>
              <span className="mt-2 block break-all font-semibold text-ink dark:text-ivory">{form.avatarUrl ? "Đã cập nhật" : "Chưa cập nhật"}</span>
            </p>
            <p className="rounded-2xl border border-ink/5 p-4 dark:border-white/10 sm:col-span-2">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/50">Địa chỉ</span>
              <span className="mt-2 block break-words font-semibold text-ink dark:text-ivory">{form.address || "Chưa cập nhật"}</span>
            </p>
            {success ? <p className="rounded-xl bg-sage/10 px-4 py-3 text-xs font-semibold text-sage sm:col-span-2">{success}</p> : null}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
              Họ tên
            </span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="hm-field mt-2 h-12 w-full"
              maxLength={80}
              required
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
              Email
            </span>
            <input value={user.email} className="hm-field mt-2 h-12 w-full opacity-70" disabled />
          </label>

          <div className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
              Ảnh đại diện
            </span>
            <div className="mt-2 grid gap-4 sm:grid-cols-[96px_1fr]">
              <AvatarPreview avatarUrl={form.avatarUrl} initial={avatarInitial} label="Ảnh đại diện đang chọn" size="small" />
              <div className="grid gap-3">
                <input
                  value={form.avatarUrl}
                  onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                  className="hm-field h-12 w-full"
                  placeholder="https://... hoặc /uploads/..."
                />
                <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-ink/10 px-5 text-xs font-bold uppercase tracking-[0.15em] text-ink transition-all hover:border-copper hover:bg-copper hover:text-white dark:border-ivory/10 dark:text-ivory">
                  {isUploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  {isUploadingAvatar ? "Đang tải" : "Tải ảnh"}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} disabled={isUploadingAvatar || isSaving} />
                </label>
              </div>
            </div>
            <p className="mt-2 text-xs text-ink/45 dark:text-ivory/55">Chọn ảnh từ máy tính hoặc dán URL ảnh. File tối đa 5MB.</p>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
              Số điện thoại
            </span>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="hm-field mt-2 h-12 w-full"
              placeholder="Ví dụ: 0912345678"
              inputMode="tel"
              maxLength={20}
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
              Địa chỉ giao hàng
            </span>
            <textarea
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              className="hm-field mt-2 min-h-28 w-full p-4"
              placeholder="Nhập địa chỉ mặc định cho đơn hàng"
              maxLength={255}
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={isSaving} className="hm-btn-primary h-11 flex-1 px-5 text-xs">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {isSaving ? "Đang lưu" : "Lưu thay đổi"}
            </button>
            <button type="button" onClick={resetForm} disabled={isSaving} className="hm-btn-secondary h-11 flex-1 px-5 text-xs">
              <X size={16} />
              Hủy
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
