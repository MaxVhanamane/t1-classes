"use client";

import Image from "next/image";
import { useState } from "react";
import { Award, GraduationCap, UserRound, Users2 } from "lucide-react";

const TEACHERS = [
  {
    name: "Rahul Deshmukh",
    subject: "Physics Faculty",
    image: "/images/teachers/teacher-1.webp",
    experience: "10+ Years Experience",
    students: "15K+ Students",
    achievement: "JEE Advanced Mentor",
    bio: "Specializes in building strong conceptual understanding and helping students solve advanced Physics problems with confidence.",
  },
  {
    name: "Sneha Kulkarni",
    subject: "Chemistry Faculty",
    image: "/images/teachers/teacher-2.webp",
    experience: "8+ Years Experience",
    students: "12K+ Students",
    achievement: "NEET Specialist",
    bio: "Focuses on simplifying Chemistry through structured explanations, revision strategies, and exam-oriented practice.",
  },
  {
    name: "Aditya Patil",
    subject: "Mathematics Faculty",
    image: "/images/teachers/teacher-3.webp",
    experience: "9+ Years Experience",
    students: "18K+ Students",
    achievement: "Problem Solving Expert",
    bio: "Passionate about teaching Mathematics with logical thinking, shortcuts, and step-by-step problem solving.",
  },
];

function TeacherAvatar({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
        <UserRound className="size-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
      <Image
        src={src}
        alt={alt}
        fill
        onError={() => setFailed(true)}
        className="object-cover"
      />
    </div>
  );
}

export function TeachersSection() {
  return (
    <section>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Expert Faculty
        </p>

        <h2 className="mt-4 text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          Learn from experienced educators and mentors.
        </h2>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Dedicated teachers focused on conceptual clarity, structured learning,
          and exam-focused preparation.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {TEACHERS.map((teacher) => (
          <article
            key={teacher.name}
            className="rounded-2xl border border-border/60 bg-background p-6 transition-colors hover:border-primary/20"
          >
            <div className="flex items-start gap-5">
              <TeacherAvatar src={teacher.image} alt={teacher.name} />

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-xl font-bold tracking-tight">
                  {teacher.name}
                </h3>

                <p className="mt-1 text-sm font-medium text-primary">
                  {teacher.subject}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {teacher.bio}
            </p>

            <div className="mt-6 space-y-3 border-t border-border/60 pt-5">
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="size-4 text-primary" />
                <span>{teacher.experience}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Users2 className="size-4 text-primary" />
                <span>{teacher.students}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Award className="size-4 text-primary" />
                <span>{teacher.achievement}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
