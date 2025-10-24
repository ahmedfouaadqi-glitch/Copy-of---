import React, { useState } from 'react';
import { Fingerprint, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveUserProfile, setBiometricEnabled } from '../services/profileService';
import { UserProfile } from '../types';

interface UserProfileSetupPageProps {
  onComplete: () => void;
}

const UserProfileSetupPage: React.FC<UserProfileSetupPageProps> = ({ onComplete }) => {
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        age: 0,
        weight: 0,
        profession: '',
        mainGoal: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: name === 'name' || name === 'profession' || name === 'mainGoal' ? value : Number(value) }));
    };

    const registerBiometric = async () => {
        if (!navigator.credentials || !navigator.credentials.create) {
            toast.error('المتصفح أو الجهاز لا يدعم المصادقة الحيوية.');
            return;
        }

        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const userId = new Uint8Array(16);
            window.crypto.getRandomValues(userId);

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: 'صحتك/كي', id: window.location.hostname },
                    user: {
                        id: userId,
                        name: profile.name.trim() || 'user',
                        displayName: profile.name.trim() || 'المستخدم',
                    },
                    pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                    },
                    timeout: 60000,
                    attestation: 'none'
                }
            });

            if (credential) {
                setBiometricEnabled(true);
                toast.success('تم تفعيل الدخول بالبصمة بنجاح!');
            }
        } catch (err) {
            console.error('Biometric registration failed:', err);
            toast.error('فشل تفعيل الدخول بالبصمة. ربما قمت بإلغاء العملية.');
            setBiometricEnabled(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.name.trim() || profile.age <= 0 || profile.weight <= 0 || !profile.profession.trim() || !profile.mainGoal.trim()) {
            toast.error('الرجاء ملء جميع الحقول بشكل صحيح.');
            return;
        }
        setIsSaving(true);
        saveUserProfile(profile);

        // Attempt to register biometrics automatically on save
        await registerBiometric();

        setTimeout(() => {
            setIsSaving(false);
            onComplete();
        }, 800);
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <HeartPulse className="w-16 h-16 text-teal-400 mx-auto animate-pulse mb-3" />
            <h1 className="text-4xl font-bold">صحتك كي</h1>
            <p className="text-gray-400 mt-2">البوابة الرئيسية الى حياة الروح التقنية</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">لنتعرف عليك أولاً</h2>
                <p className="text-gray-400 mt-1 text-sm">هذه المعلومات ستساعد "الروح" على فهمك وتقديم أفضل مساعدة لك.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="الاسم الثلاثي" value={profile.name} onChange={handleChange} required className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"/>
              <input type="number" name="age" placeholder="العمر" value={profile.age || ''} onChange={handleChange} required className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"/>
              <input type="number" name="weight" placeholder="الوزن (كجم)" value={profile.weight || ''} onChange={handleChange} required className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"/>
              <input type="text" name="profession" placeholder="المهنة" value={profile.profession} onChange={handleChange} required className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"/>
              <input type="text" name="mainGoal" placeholder="ما هو هدفك الرئيسي؟ (صحي، مهني، حياتي)" value={profile.mainGoal} onChange={handleChange} required className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"/>
              
              <button type="submit" disabled={isSaving} className="w-full mt-4 p-4 bg-teal-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-teal-600 transition active:scale-95 disabled:bg-teal-400/50">
                <Fingerprint size={20}/>
                {isSaving ? '...جاري الحفظ' : 'حفظ وتأمين حسابي بالبصمة الحيوية'}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSetupPage;