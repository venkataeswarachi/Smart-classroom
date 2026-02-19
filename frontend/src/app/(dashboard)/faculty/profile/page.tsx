"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User, Mail, Phone, Briefcase, Award,
    GraduationCap, PenSquare, Loader2, Save,
    X, CheckCircle2, Building2, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Matches the actual backend Faculty entity exactly
interface FacultyProfile {
    name: string;
    email: string;
    dept: string;
    mobile: number;
    position: string;
    qualification: string;
}

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

export default function FacultyProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<FacultyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<FacultyProfile | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/faculty/profile");
            setProfile(res.data);
            setFormData(res.data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData) return;
        setSaving(true);
        try {
            const res = await api.put("/faculty/profile", formData);
            setProfile(res.data);
            setFormData(res.data);
            setIsEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Failed to update profile", err);
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData(profile);
    };

    const update = <K extends keyof FacultyProfile>(key: K, value: FacultyProfile[K]) =>
        setFormData(prev => ({ ...prev!, [key]: value }));

    // ─── Loading ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="font-medium animate-pulse">Loading your profile…</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-muted-foreground">Profile not found. Please contact the administrator.</p>
            </div>
        );
    }

    // ─── Editable field definitions (keyed to real backend fields) ────
    const editableFields: {
        key: keyof FacultyProfile;
        label: string;
        icon: React.ElementType;
        type?: string;
        readOnly?: boolean;
    }[] = [
            { key: "name", label: "Full Name", icon: User },
            { key: "email", label: "Email Address", icon: Mail, readOnly: true },
            { key: "position", label: "Position", icon: Briefcase },
            { key: "dept", label: "Department", icon: Building2 },
            { key: "mobile", label: "Mobile Number", icon: Phone, type: "tel" },
            { key: "qualification", label: "Qualification", icon: GraduationCap },
        ];

    return (
        <div className="max-w-5xl mx-auto pb-16">

            {/* ── Hero Banner ──────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden h-52 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 shadow-xl shadow-orange-500/20"
            >
                {/* Decorative blobs */}
                <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.4) 39px,rgba(255,255,255,.4) 40px),
                            repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.4) 39px,rgba(255,255,255,.4) 40px)`
                    }}
                />

                {/* Name + role */}
                <div className="absolute bottom-6 left-8 text-white">
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">Faculty Profile</p>
                    <h1 className="text-3xl font-extrabold tracking-tight drop-shadow">{profile.name}</h1>
                    <p className="text-sm opacity-80 mt-0.5">
                        {profile.position || "Faculty Member"}
                        {profile.dept ? ` · ${profile.dept}` : ""}
                    </p>
                </div>

                {/* Action buttons */}
                <div className="absolute top-5 right-5 flex gap-2">
                    <AnimatePresence mode="wait">
                        {!isEditing ? (
                            <motion.div key="edit" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                <Button onClick={() => setIsEditing(true)} variant="ghost"
                                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm gap-2 font-semibold">
                                    <PenSquare className="h-4 w-4" /> Edit Profile
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div key="editing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex gap-2">
                                <Button onClick={cancelEdit} variant="ghost"
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm gap-2">
                                    <X className="h-4 w-4" /> Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={saving}
                                    className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-semibold gap-2">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ── Avatar + Stat Chips ──────────────────────────────── */}
            <div className="relative px-8">
                {/* Avatar overlapping banner */}
                <div className="absolute -top-14 left-8 h-28 w-28 rounded-2xl border-4 border-background shadow-2xl bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center text-white text-3xl font-extrabold select-none">
                    {getInitials(profile.name)}
                </div>

                {/* Stat chips */}
                <div className="ml-36 pt-3 pb-6 flex flex-wrap gap-3">
                    {[
                        { icon: Building2, label: "Department", value: profile.dept || "—" },
                        { icon: Briefcase, label: "Position", value: profile.position || "—" },
                        { icon: GraduationCap, label: "Qualification", value: profile.qualification || "—" },
                    ].map(stat => (
                        <div key={stat.label} className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                <stat.icon className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                                <p className="text-sm font-bold text-foreground truncate max-w-[160px]">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Success Toast ────────────────────────────────────── */}
            <AnimatePresence>
                {saved && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="mx-8 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium shadow-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        Profile updated successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Field Form ───────────────────────────────────────── */}
            <div className="px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-foreground text-base">Personal & Professional Info</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isEditing ? "Make your changes and hit Save Changes." : "Click Edit Profile to update your information."}
                            </p>
                        </div>
                        {isEditing && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                                Editing
                            </motion.span>
                        )}
                    </div>

                    <div className="p-6 grid gap-5 sm:grid-cols-2">
                        {editableFields.map((field, i) => {
                            const displayValue = field.readOnly
                                ? (user?.sub ?? profile.email ?? "")
                                : String(formData?.[field.key] ?? "");

                            return (
                                <motion.div
                                    key={field.key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.04 * i }}
                                    className="space-y-1.5"
                                >
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <field.icon className="h-3.5 w-3.5" />
                                        {field.label}
                                        {field.readOnly && (
                                            <span className="ml-1 text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-normal normal-case tracking-normal">
                                                read only
                                            </span>
                                        )}
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            type={field.type || "text"}
                                            value={displayValue}
                                            onChange={e => {
                                                if (field.readOnly) return;
                                                const val = field.type === "tel"
                                                    ? (Number(e.target.value) as FacultyProfile[typeof field.key])
                                                    : (e.target.value as FacultyProfile[typeof field.key]);
                                                update(field.key, val);
                                            }}
                                            disabled={!isEditing || field.readOnly}
                                            className={cn(
                                                "h-11 rounded-xl border transition-all duration-200 font-medium",
                                                field.readOnly
                                                    ? "bg-muted/50 opacity-60 cursor-not-allowed"
                                                    : isEditing
                                                        ? "bg-background border-orange-200 focus:border-orange-400 focus-visible:ring-1 focus-visible:ring-orange-400/40"
                                                        : "bg-muted/30 border-transparent cursor-default"
                                            )}
                                        />
                                        {isEditing && !field.readOnly && (
                                            <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
