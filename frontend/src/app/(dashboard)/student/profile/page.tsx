"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCircle } from "lucide-react";

export default function StudentProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        mobile: "",
        address: "",
        bloodGroup: "",
        mothername: "",
        fathername: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/student/profile");
                setProfile(res.data);
                setForm({
                    name: res.data.name || "",
                    mobile: res.data.mobile || "",
                    address: res.data.address || "",
                    bloodGroup: res.data.bloodGroup || "",
                    mothername: res.data.mothername || "",
                    fathername: res.data.fathername || ""
                });
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put("/student/profile", form);
            alert("Profile updated successfully ✅");
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update profile ❌");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading profile...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <UserCircle className="h-12 w-12 text-muted-foreground" />
                    <div>
                        <CardTitle>{profile.email}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Roll No: {profile.rollno}
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input value={profile.dept} disabled />
                        <Input value={profile.section} disabled />
                        <Input value={`Year ${profile.year}`} disabled />
                        <Input value={`Semester ${profile.semester}`} disabled />

                    </div>

                    
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        disabled />
                    </div>

                    <div className="space-y-2">
                        <Label>Mobile</Label>
                        <Input
                            value={form.mobile}
                            onChange={(e) =>
                                setForm({ ...form, mobile: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                            value={form.address}
                            onChange={(e) =>
                                setForm({ ...form, address: e.target.value })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Blood Group</Label>
                            <Input
                                value={form.bloodGroup}
                                onChange={(e) =>
                                    setForm({ ...form, bloodGroup: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label>Mother Name</Label>
                            <Input
                                value={form.mothername}
                                onChange={(e) =>
                                    setForm({ ...form, mothername: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Father Name</Label>
                        <Input
                            value={form.fathername}
                            onChange={(e) =>
                                setForm({ ...form, fathername: e.target.value })
                            }
                        />
                    </div>

                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
