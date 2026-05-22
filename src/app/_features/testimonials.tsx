import Image from "next/image";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "JEE Advanced Student",
    image: "/images/students/student-1.webp",
    content:
      "The test platform feels exactly like real competitive exams. Topic-wise practice and analytics helped me improve consistently.",
  },
  {
    name: "Priya Patil",
    role: "NEET Aspirant",
    image: "/images/students/student-2.webp",
    content:
      "The structured learning flow made preparation much easier. I could revise concepts quickly and practice instantly after learning.",
  },
  {
    name: "Rohan Kulkarni",
    role: "Foundation Student",
    image: "/images/students/student-3.webp",
    content:
      "Live classes, recordings, notes, and tests are all in one place. The overall experience feels smooth and professional.",
  },
];

export function TestimonialsSection() {
  return (
    <section>
      {/* heading */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Student Experiences
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Trusted by students preparing seriously.
        </h2>

        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          Thousands of students use T1 Classes daily to learn, practice, and
          improve their performance.
        </p>
      </div>

      {/* testimonials */}
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.name}
            className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/70 p-6 shadow-sm"
          >
            {/* subtle glow */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/5 to-transparent" />

            {/* stars */}
            <div className="relative flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="size-4 fill-current text-yellow-500"
                />
              ))}
            </div>

            {/* content */}
            <p className="relative mt-6 text-sm leading-7 text-muted-foreground">
              “{testimonial.content}”
            </p>

            {/* user */}
            <div className="relative mt-8 flex items-center gap-4">
              <div className="overflow-hidden rounded-full border border-border/60">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={52}
                  height={52}
                  className="size-13 object-cover"
                />
              </div>

              <div>
                <p className="font-semibold tracking-tight">
                  {testimonial.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
