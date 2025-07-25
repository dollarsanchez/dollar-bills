import { useState, useEffect } from "react";
import { Trophy, Star, Crown, Zap, Heart, Target } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  condition: (stats: UserStats) => boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UserStats {
  partiesCreated: number;
  totalAmountSplit: number;
  totalItems: number;
  totalPeople: number;
  timesAsHost: number;
  biggestParty: number;
  mostExpensiveItem: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
}

const achievements: Achievement[] = [
  {
    id: "first_party",
    title: "🎉 Party Starter",
    description: "สร้างปาร์ตี้แรกของคุณ",
    icon: <Star className="w-6 h-6" />,
    condition: (stats) => stats.partiesCreated >= 1,
    rarity: "common",
  },
  {
    id: "host_master",
    title: "👑 Host Master",
    description: "เป็น Host ครบ 5 ครั้ง",
    icon: <Crown className="w-6 h-6" />,
    condition: (stats) => stats.timesAsHost >= 5,
    rarity: "rare",
  },
  {
    id: "big_spender",
    title: "💰 Big Spender",
    description: "แบ่งเงินรวมเกิน 10,000 บาท",
    icon: <Trophy className="w-6 h-6" />,
    condition: (stats) => stats.totalAmountSplit >= 10000,
    rarity: "epic",
  },
  {
    id: "party_animal",
    title: "🦁 Party Animal",
    description: "จัดปาร์ตี้ที่มีคนเกิน 10 คน",
    icon: <Zap className="w-6 h-6" />,
    condition: (stats) => stats.biggestParty >= 10,
    rarity: "rare",
  },
  {
    id: "generous_friend",
    title: "❤️ Generous Friend",
    description: "เพิ่มรายการอาหารเกิน 50 รายการ",
    icon: <Heart className="w-6 h-6" />,
    condition: (stats) => stats.totalItems >= 50,
    rarity: "epic",
  },
  {
    id: "perfectionist",
    title: "🎯 Perfectionist",
    description: "สร้างปาร์ตี้ 20 ครั้ง",
    icon: <Target className="w-6 h-6" />,
    condition: (stats) => stats.partiesCreated >= 20,
    rarity: "legendary",
  },
];

function AchievementNotification({
  achievement,
  isVisible,
  onClose,
}: AchievementNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const rarityColors = {
    common: "from-gray-500 to-gray-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-yellow-500 to-orange-500",
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-scale">
      <div
        className={`glass rounded-xl p-4 border-2 bg-gradient-to-r ${
          rarityColors[achievement.rarity]
        } border-white/30 shadow-2xl`}
      >
        <div className="flex items-center space-x-3">
          <div className="text-white">{achievement.icon}</div>
          <div>
            <h3 className="font-bold text-white">Achievement Unlocked!</h3>
            <p className="text-sm text-white/90">{achievement.title}</p>
            <p className="text-xs text-white/70">{achievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AchievementSystemProps {
  stats: UserStats;
}

export default function AchievementSystem({ stats }: AchievementSystemProps) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    []
  );
  const [currentNotification, setCurrentNotification] =
    useState<Achievement | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const savedAchievements = JSON.parse(
      localStorage.getItem("one-and-done-achievements") || "[]"
    );
    setUnlockedAchievements(savedAchievements);
  }, []);

  useEffect(() => {
    achievements.forEach((achievement) => {
      if (
        !unlockedAchievements.includes(achievement.id) &&
        achievement.condition(stats)
      ) {
        // Unlock new achievement
        const newUnlocked = [...unlockedAchievements, achievement.id];
        setUnlockedAchievements(newUnlocked);
        localStorage.setItem(
          "one-and-done-achievements",
          JSON.stringify(newUnlocked)
        );

        // Show notification
        setCurrentNotification(achievement);
        setShowNotification(true);
      }
    });
  }, [stats, unlockedAchievements]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setTimeout(() => setCurrentNotification(null), 300);
  };

  return (
    <>
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          isVisible={showNotification}
          onClose={handleCloseNotification}
        />
      )}
    </>
  );
}

export { achievements, type UserStats, type Achievement };
