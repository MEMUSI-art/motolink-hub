import { motion } from 'framer-motion';
import { GraduationCap, Clock, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Course {
  id: string;
  title: string;
  duration: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  popular?: boolean;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Beginner Rider Course',
    duration: '3 Days',
    price: 8500,
    level: 'beginner',
    features: [
      'Basic motorcycle controls',
      'Road safety fundamentals',
      'Traffic rules & regulations',
      'Practical riding sessions',
      'License preparation'
    ],
    popular: true
  },
  {
    id: '2',
    title: 'Defensive Riding',
    duration: '2 Days',
    price: 6000,
    level: 'intermediate',
    features: [
      'Hazard perception',
      'Emergency braking techniques',
      'Night riding skills',
      'Highway riding',
      'Certificate included'
    ]
  },
  {
    id: '3',
    title: 'Advanced Sport Riding',
    duration: '4 Days',
    price: 15000,
    level: 'advanced',
    features: [
      'Performance riding techniques',
      'Track day preparation',
      'Cornering mastery',
      'Advanced braking',
      'Race track session'
    ]
  }
];

const levelColors = {
  beginner: 'bg-green-500/10 text-green-600 border-green-500/30',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  advanced: 'bg-red-500/10 text-red-600 border-red-500/30'
};

const stats = [
  { icon: Users, value: '2,500+', label: 'Trained Riders' },
  { icon: Award, value: '98%', label: 'Pass Rate' },
  { icon: GraduationCap, value: '15+', label: 'Expert Instructors' },
  { icon: Clock, value: '5 Years', label: 'Experience' }
];

const RidingSchoolSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <GraduationCap className="w-3 h-3 mr-1" />
            MotoLink Riding Academy
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Learn to Ride <span className="text-primary">Like a Pro</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional motorcycle training for all skill levels. Get licensed, ride safely, and join Kenya's community of confident riders.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-card border border-border/50"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Courses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full hover:shadow-xl transition-all duration-300 ${course.popular ? 'border-primary shadow-lg scale-[1.02]' : 'border-border/50'}`}>
                {course.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={levelColors[course.level]}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-primary">
                      KES {course.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm"> / course</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {course.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${course.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={course.popular ? 'default' : 'outline'}
                  >
                    Enroll Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Corporate training packages available for boda-boda operators and delivery companies
          </p>
          <Button variant="link" className="text-primary">
            Contact for Group Rates <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default RidingSchoolSection;
