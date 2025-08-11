import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, User } from 'lucide-react';
import { patientApi, UserProfile } from '@/lib/api';

const PatientProfileTab = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    patientApi.getCurrentUserProfile()
      .then((data) => {
        setProfile(data);
        setForm(data);
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await patientApi.updateUserProfile(form);
      setProfile(updated);
      setEdit(false);
      setSuccess('Profile updated!');
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-500"><Loader2 className="animate-spin inline w-6 h-6 mr-2" />Loading profile...</div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader className="flex flex-col items-center">
        <Avatar className="w-20 h-20 mb-2">
          {profile?.profile_picture ? (
            <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
          )}
        </Avatar>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
        {edit ? (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={form.name || ''} onChange={handleChange} placeholder="Full Name" required />
              <Input name="email" value={form.email || ''} onChange={handleChange} placeholder="Email" type="email" required />
              <Input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Phone" required />
              <Input name="gender" value={form.gender || ''} onChange={handleChange} placeholder="Gender" />
              <Input name="date_of_birth" value={form.date_of_birth || ''} onChange={handleChange} placeholder="Date of Birth" type="date" />
              <Input name="blood_group" value={form.blood_group || ''} onChange={handleChange} placeholder="Blood Group" />
              <Input name="allergies" value={form.allergies || ''} onChange={handleChange} placeholder="Allergies" />
            </div>
            <Input name="street" value={form.street || ''} onChange={handleChange} placeholder="Street" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="city" value={form.city || ''} onChange={handleChange} placeholder="City" />
              <Input name="state" value={form.state || ''} onChange={handleChange} placeholder="State" />
              <Input name="pincode" value={form.pincode || ''} onChange={handleChange} placeholder="Pincode" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => { setEdit(false); setForm(profile!); }}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}Save</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="font-bold text-lg">{profile?.name}</div>
            <div className="text-gray-600">{profile?.email}</div>
            <div className="text-gray-600">{profile?.phone}</div>
            <div className="text-gray-600">{profile?.gender} {profile?.date_of_birth ? `| DOB: ${profile.date_of_birth}` : ''}</div>
            <div className="text-gray-600">Blood Group: {profile?.blood_group}</div>
            <div className="text-gray-600">Allergies: {profile?.allergies}</div>
            <div className="text-gray-600">{profile?.street}, {profile?.city}, {profile?.state} {profile?.pincode}</div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setEdit(true)}>Edit</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientProfileTab;
