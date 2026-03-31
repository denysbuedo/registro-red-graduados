import Link from "next/link";

interface GraduateCardProps {
  id: number;
  name: string;
  country: string;
  university: string;
  career: string;
  graduationYear: number;
  currentProfession: string;
  currentCompany?: string | null;
  photoUrl?: string | null;
}

export function GraduateCard({
  id,
  name,
  country,
  university,
  career,
  graduationYear,
  currentProfession,
  currentCompany,
  photoUrl,
}: GraduateCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={`/egresados/${id}`}
      className="block bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-5 hover:border-neutral-600 hover:bg-neutral-800 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-semibold text-base group-hover:text-red-400 transition-colors truncate">
            {name}
          </h3>
          <p className="text-neutral-400 text-sm truncate">
            {currentProfession}
            {currentCompany && ` en ${currentCompany}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs bg-neutral-700/50 text-neutral-300 px-2 py-1 rounded-md">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {country}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-neutral-700/50 text-neutral-300 px-2 py-1 rounded-md">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
              </svg>
              {university}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-neutral-700/50 text-neutral-300 px-2 py-1 rounded-md">
              {career}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-neutral-700/50 text-neutral-300 px-2 py-1 rounded-md">
              {graduationYear}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
