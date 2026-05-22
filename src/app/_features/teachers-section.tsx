import Image from "next/image";
import { Award, BookOpen, GraduationCap, Users2 } from "lucide-react";

const TEACHERS = [
  {
    name: "Rahul Deshmukh",
    subject: "Physics Faculty",
    image: "/images/teachers/teacher-1.webp",
    experience: "10+ Years Experience",
    students: "15K+ Students",
    achievement: "JEE Advanced Mentor",
  },
  {
    name: "Sneha Kulkarni",
    subject: "Chemistry Faculty",
    image: "/images/teachers/teacher-2.webp",
    experience: "8+ Years Experience",
    students: "12K+ Students",
    achievement: "NEET Specialist",
  },
  {
    name: "Aditya Patil",
    subject: "Mathematics Faculty",
    image: "/images/teachers/teacher-3.webp",
    experience: "9+ Years Experience",
    students: "18K+ Students",
    achievement: "Problem Solving Expert",
  },
];

export function TeachersSection() {
  return (
    <section>
      {/* heading */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Expert Faculty
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Learn from experienced educators and mentors.
        </h2>

        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          Dedicated teachers focused on conceptual clarity, structured learning,
          and exam-focused preparation.
        </p>
      </div>

      {/* cards */}
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {TEACHERS.map((teacher) => (
          <div
            key={teacher.name}
            className="group overflow-hidden rounded-[2rem] border border-border/60 bg-background/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* image */}
            <div className="relative aspect-[4/4.5] overflow-hidden">
              <Image
                src={teacher.image}
                alt={teacher.name}
                width={900}
                height={1200}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* subject */}
              <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
                {teacher.subject}
              </div>
            </div>

            {/* content */}
            <div className="p-6">
              <h3 className="text-2xl font-black tracking-tight">
                {teacher.name}
              </h3>

              {/* meta */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <GraduationCap className="size-4" />
                  <span>{teacher.experience}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Users2 className="size-4" />
                  <span>{teacher.students}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Award className="size-4" />
                  <span>{teacher.achievement}</span>
                </div>
              </div>

              {/* footer */}
              <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm font-medium">
                <BookOpen className="size-4" />
                Concept-focused teaching approach
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
