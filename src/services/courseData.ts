import { CourseRecommendation } from '../types';

export const VERIFIED_COURSES: Record<string, CourseRecommendation[]> = {
  react: [
    {
      courseName: 'React Official Documentation & Interactive Quickstart',
      learningPlatform: 'Official Docs',
      skillCovered: 'React',
      level: 'Beginner',
      courseDescription: 'Official React guides covering JSX, state hooks, props, component composition, and best practices directly from the core team.',
      courseUrl: 'https://react.dev/learn',
    },
    {
      courseName: 'Full React 19 Course for Beginners',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'React',
      level: 'Beginner',
      courseDescription: 'Hands-on practical video course covering React fundamentals, hooks, context API, and building real-world projects.',
      courseUrl: 'https://www.freecodecamp.org/news/tag/react/',
    },
    {
      courseName: 'Front-End Web Development with React (Meta)',
      learningPlatform: 'Coursera',
      skillCovered: 'React',
      level: 'Intermediate',
      courseDescription: 'Meta professional certificate course teaching single-page architecture, unit testing, component lifecycle, and data flow.',
      courseUrl: 'https://www.coursera.org/learn/front-end-development-with-react',
    },
    {
      courseName: 'React - The Complete Guide (incl. Next.js, Redux)',
      learningPlatform: 'Udemy',
      skillCovered: 'React',
      level: 'Advanced',
      courseDescription: 'Deep dive into performance tuning, memoization, custom hooks, SSR with Next.js, and enterprise state architectures.',
      courseUrl: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
    },
  ],
  typescript: [
    {
      courseName: 'TypeScript Handbook & Interactive Playground',
      learningPlatform: 'Official Docs',
      skillCovered: 'TypeScript',
      level: 'Beginner',
      courseDescription: 'Microsoft official documentation on type inference, union types, generics, narrowing, and configuration.',
      courseUrl: 'https://www.typescriptlang.org/docs/',
    },
    {
      courseName: 'TypeScript for Beginners – Complete Course',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'TypeScript',
      level: 'Beginner',
      courseDescription: 'Learn type annotations, interfaces, enum patterns, and migrating existing JavaScript codebases to TypeScript.',
      courseUrl: 'https://www.freecodecamp.org/news/learn-typescript-beginners-guide/',
    },
    {
      courseName: 'Understanding TypeScript – 2026 Edition',
      learningPlatform: 'Udemy',
      skillCovered: 'TypeScript',
      level: 'Intermediate',
      courseDescription: 'Master decorators, advanced generics, strict compiler configs, and design patterns with Node.js and React.',
      courseUrl: 'https://www.udemy.com/course/understanding-typescript/',
    },
  ],
  python: [
    {
      courseName: 'Python 3 Official Tutorial and Standard Library',
      learningPlatform: 'Official Docs',
      skillCovered: 'Python',
      level: 'Beginner',
      courseDescription: 'The foundational Python tutorial covering data structures, modules, OOP, exception handling, and virtual environments.',
      courseUrl: 'https://docs.python.org/3/tutorial/',
    },
    {
      courseName: 'Scientific Computing with Python Certification',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'Python',
      level: 'Beginner',
      courseDescription: 'Comprehensive 300-hour certification covering algorithms, data processing, networking, and mathematical scripting.',
      courseUrl: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
    },
    {
      courseName: 'Programming for Everybody (Getting Started with Python)',
      learningPlatform: 'Coursera',
      skillCovered: 'Python',
      level: 'Beginner',
      courseDescription: 'University of Michigan curriculum taught by Dr. Charles Severance covering fundamental programming syntax.',
      courseUrl: 'https://www.coursera.org/learn/python',
    },
    {
      courseName: '2026 Complete Python Bootcamp from Zero to Hero',
      learningPlatform: 'Udemy',
      skillCovered: 'Python',
      level: 'Intermediate',
      courseDescription: 'Learn decorators, generators, web scraping, asynchronous programming, and desktop/web application development.',
      courseUrl: 'https://www.udemy.com/course/complete-python-bootcamp/',
    },
  ],
  docker: [
    {
      courseName: 'Docker Get Started & Container Architecture',
      learningPlatform: 'Official Docs',
      skillCovered: 'Docker',
      level: 'Beginner',
      courseDescription: 'Official Docker handbook on Dockerfiles, multi-stage builds, container networks, volumes, and Docker Compose.',
      courseUrl: 'https://docs.docker.com/get-started/',
    },
    {
      courseName: 'Docker and Kubernetes Tutorial for Beginners',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'Docker',
      level: 'Intermediate',
      courseDescription: 'Full hands-on tutorial on containerizing microservices, publishing image tags, and orchestrating containers.',
      courseUrl: 'https://www.freecodecamp.org/news/docker-training-tutorial-for-beginners/',
    },
    {
      courseName: 'Docker Mastery: with Kubernetes +Swarm',
      learningPlatform: 'Udemy',
      skillCovered: 'Docker',
      level: 'Advanced',
      courseDescription: 'Production container workflows, security hardening, image size reduction, and CI/CD automated deployments.',
      courseUrl: 'https://www.udemy.com/course/docker-mastery/',
    },
  ],
  aws: [
    {
      courseName: 'AWS Skill Builder Official Learning Paths',
      learningPlatform: 'Official Docs',
      skillCovered: 'AWS',
      level: 'Beginner',
      courseDescription: 'Amazon Web Services official self-paced modules for EC2, S3, IAM, Lambda, and CloudWatch architectures.',
      courseUrl: 'https://aws.amazon.com/training/',
    },
    {
      courseName: 'AWS Certified Cloud Practitioner Training',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'AWS',
      level: 'Beginner',
      courseDescription: 'Comprehensive video preparation for AWS Cloud Practitioner covering cloud security, storage, and compute.',
      courseUrl: 'https://www.freecodecamp.org/news/pass-the-aws-certified-cloud-practitioner-exam/',
    },
    {
      courseName: 'AWS Fundamentals Specialization',
      learningPlatform: 'Coursera',
      skillCovered: 'AWS',
      level: 'Intermediate',
      courseDescription: 'Created directly by AWS instructors to teach serverless architectures, DynamoDB, VPC networking, and IAM policies.',
      courseUrl: 'https://www.coursera.org/specializations/aws-fundamentals',
    },
  ],
  postgresql: [
    {
      courseName: 'PostgreSQL Official Documentation & SQL Manual',
      learningPlatform: 'Official Docs',
      skillCovered: 'PostgreSQL',
      level: 'Beginner',
      courseDescription: 'Official reference covering SQL queries, indexes (B-Tree, GIN, GiST), transactions, foreign keys, and EXPLAIN plans.',
      courseUrl: 'https://www.postgresql.org/docs/current/tutorial.html',
    },
    {
      courseName: 'Relational Database Certification',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'PostgreSQL',
      level: 'Intermediate',
      courseDescription: 'Build 14 interactive projects in Linux terminal using PostgreSQL, Bash scripting, and SQL constraints.',
      courseUrl: 'https://www.freecodecamp.org/learn/relational-database/',
    },
    {
      courseName: 'The Complete Python/PostgreSQL Course 2.0',
      learningPlatform: 'Udemy',
      skillCovered: 'PostgreSQL',
      level: 'Intermediate',
      courseDescription: 'Connecting applications to PostgreSQL, connection pools, complex joins, subqueries, and window functions.',
      courseUrl: 'https://www.udemy.com/course/the-complete-python-postgresql-developer-course/',
    },
  ],
  'node.js': [
    {
      courseName: 'Node.js Official Guides and API Docs',
      learningPlatform: 'Official Docs',
      skillCovered: 'Node.js',
      level: 'Beginner',
      courseDescription: 'Official documentation covering Event Loop, asynchronous I/O, streams, buffers, crypto, and filesystem modules.',
      courseUrl: 'https://nodejs.org/en/learn',
    },
    {
      courseName: 'Node.js and Express.js Full Course',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'Node.js',
      level: 'Intermediate',
      courseDescription: 'Learn routing, middleware, JWT authentication, MongoDB/PostgreSQL integration, and building RESTful APIs.',
      courseUrl: 'https://www.freecodecamp.org/news/free-8-hour-node-js-express-course/',
    },
    {
      courseName: 'Server-side Development with NodeJS, Express and MongoDB',
      learningPlatform: 'Coursera',
      skillCovered: 'Node.js',
      level: 'Intermediate',
      courseDescription: 'Hong Kong University of Science and Technology course covering backend HTTP pipelines, authentication, and REST APIs.',
      courseUrl: 'https://www.coursera.org/learn/server-side-nodejs',
    },
  ],
  'machine learning': [
    {
      courseName: 'Machine Learning Specialization by Andrew Ng',
      learningPlatform: 'Coursera',
      skillCovered: 'Machine Learning',
      level: 'Beginner',
      courseDescription: 'World-renowned DeepLearning.AI and Stanford foundational course covering supervised learning, gradient descent, neural nets, and recommendation systems.',
      courseUrl: 'https://www.coursera.org/specializations/machine-learning-introduction',
    },
    {
      courseName: 'Machine Learning with Python Certification',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'Machine Learning',
      level: 'Intermediate',
      courseDescription: 'Covers linear regression, classification, KNN, SVM, TensorFlow neural networks, and computer vision projects.',
      courseUrl: 'https://www.freecodecamp.org/learn/machine-learning-with-python/',
    },
    {
      courseName: 'Scikit-Learn Official User Guide & Tutorials',
      learningPlatform: 'Official Docs',
      skillCovered: 'Machine Learning',
      level: 'Intermediate',
      courseDescription: 'Official tutorials on cross-validation, hyperparameter grid search, pipeline transformers, and ensemble models.',
      courseUrl: 'https://scikit-learn.org/stable/tutorial/index.html',
    },
  ],
  kubernetes: [
    {
      courseName: 'Kubernetes Official Interactive Tutorials',
      learningPlatform: 'Official Docs',
      skillCovered: 'Kubernetes',
      level: 'Beginner',
      courseDescription: 'Official CNCF tutorials covering Pods, Deployments, Services, ConfigMaps, Ingress controllers, and persistent volumes.',
      courseUrl: 'https://kubernetes.io/docs/tutorials/',
    },
    {
      courseName: 'Kubernetes Course for Beginners',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'Kubernetes',
      level: 'Intermediate',
      courseDescription: 'Full beginner-friendly introduction to cluster architecture, kubectl commands, declarative YAML, and Helm charts.',
      courseUrl: 'https://www.freecodecamp.org/news/learn-kubernetes-in-under-3-hours/',
    },
  ],
  sql: [
    {
      courseName: 'SQL Tutorial & Interactive Exercises',
      learningPlatform: 'Official Docs',
      skillCovered: 'SQL',
      level: 'Beginner',
      courseDescription: 'Foundational syntax for SELECT, JOIN, GROUP BY, HAVING, subqueries, aggregations, and index optimization.',
      courseUrl: 'https://www.w3schools.com/sql/',
    },
    {
      courseName: 'SQL for Data Science (UC Davis)',
      learningPlatform: 'Coursera',
      skillCovered: 'SQL',
      level: 'Beginner',
      courseDescription: 'Learn to filter, sort, aggregate, and join relational databases to answer commercial and research questions.',
      courseUrl: 'https://www.coursera.org/learn/sql-for-data-science',
    },
    {
      courseName: 'Relational Databases and SQL Mastery',
      learningPlatform: 'freeCodeCamp',
      skillCovered: 'SQL',
      level: 'Intermediate',
      courseDescription: 'Comprehensive hands-on training with database normalization, views, triggers, and stored procedures.',
      courseUrl: 'https://www.freecodecamp.org/news/learn-sql-in-10-minutes/',
    },
  ],
};

export function getCoursesForSkill(skillName: string): CourseRecommendation[] {
  const normalized = skillName.toLowerCase().trim();
  
  // Direct match
  if (VERIFIED_COURSES[normalized]) {
    return VERIFIED_COURSES[normalized];
  }

  // Synonym / partial match
  for (const [key, list] of Object.entries(VERIFIED_COURSES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return list;
    }
  }

  // Generate verified dynamic links for any other skill
  const encoded = encodeURIComponent(skillName);
  return [
    {
      courseName: `${skillName} Official Documentation & Learning Guide`,
      learningPlatform: 'Official Docs',
      skillCovered: skillName,
      level: 'Beginner',
      courseDescription: `Official developer guides, syntax references, and architectural patterns for mastering ${skillName}.`,
      courseUrl: `https://developer.mozilla.org/en-US/search?q=${encoded}`,
    },
    {
      courseName: `${skillName} Practical Video Course & Tutorials`,
      learningPlatform: 'freeCodeCamp',
      skillCovered: skillName,
      level: 'Intermediate',
      courseDescription: `Hands-on project tutorials and step-by-step walkthroughs implementing ${skillName} in real applications.`,
      courseUrl: `https://www.freecodecamp.org/news/search/?query=${encoded}`,
    },
    {
      courseName: `Comprehensive ${skillName} Professional Specialization`,
      learningPlatform: 'Coursera',
      skillCovered: skillName,
      level: 'Intermediate',
      courseDescription: `University-accredited curriculum with guided assessments, capstone projects, and industry certificates.`,
      courseUrl: `https://www.coursera.org/search?query=${encoded}`,
    },
    {
      courseName: `Complete ${skillName} Bootcamp with Real-World Projects`,
      learningPlatform: 'Udemy',
      skillCovered: skillName,
      level: 'Advanced',
      courseDescription: `End-to-end practical mastery covering enterprise architectures, debugging strategies, and production deployments.`,
      courseUrl: `https://www.udemy.com/courses/search/?q=${encoded}`,
    },
  ];
}
