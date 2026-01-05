import { Metadata } from 'next';
import Image from 'next/image';
import { Camera, Award, Users, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About | Photography Portfolio',
  description: 'Learn more about our professional photography services, experience, and passion for capturing beautiful moments.',
};

const skills = [
  { name: 'Wedding Photography', icon: Heart },
  { name: 'Portrait Photography', icon: Users },
  { name: 'Event Photography', icon: Camera },
  { name: 'Commercial Photography', icon: Award },
];

const achievements = [
  { number: '500+', label: 'Photoshoots Completed' },
  { number: '10+', label: 'Years of Experience' },
  { number: '100%', label: 'Client Satisfaction' },
  { number: '50+', label: 'Awards & Recognition' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              About Me
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Passionate about capturing life&apos;s most precious moments
            </p>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <div className="relative">
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-2xl">
                {/* Placeholder for profile image - replace with actual Cloudinary image */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                  <Camera className="w-32 h-32 text-gray-400 dark:text-gray-600" />
                </div>
                {/* Uncomment and use when you have a profile image in Cloudinary:
                <Image
                  src="your-cloudinary-profile-image-url"
                  alt="Photographer"
                  fill
                  className="object-cover"
                  priority
                />
                */}
              </div>
            </div>

            {/* Bio Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Hello, I&apos;m a Professional Photographer
              </h2>
              <div className="space-y-4 text-lg text-gray-600 dark:text-gray-400">
                <p>
                  With over a decade of experience in the photography industry, I specialize in
                  capturing authentic moments and creating timeless memories. My passion for
                  photography began at an early age and has evolved into a career dedicated to
                  excellence and creativity.
                </p>
                <p>
                  Whether it&apos;s a wedding, corporate event, or personal portrait session, I
                  approach each project with attention to detail and a commitment to delivering
                  stunning results that exceed expectations.
                </p>
                <p>
                  My work has been featured in various publications and exhibitions, and I&apos;ve
                  had the privilege of working with clients from all walks of life, helping them
                  preserve their most important moments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg"
              >
                <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {achievement.number}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Specialties
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Areas of expertise and photography services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white dark:text-gray-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {skill.name}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

