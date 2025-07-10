export const mockProfile = {
  id: 'sarah-anderson',
  display_name: 'Sarah Anderson',
  title: 'AI Research Scientist | Data Ethics Advocate',
  email: 'sarah.anderson@example.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  bio: 'Leading research in ethical AI development with a focus on fairness and transparency. Published author and frequent speaker at international conferences.',
  long_bio: 'With over a decade of experience in artificial intelligence and machine learning, I specialize in developing ethical AI solutions that prioritize fairness, transparency, and human-centered design. My research focuses on creating robust frameworks for evaluating and mitigating bias in machine learning models.',
  location: 'San Francisco, CA',
  website: 'https://sarahanderson.ai',
  linkedin_url: 'https://linkedin.com/in/sarahanderson',
  twitter_handle: '@sarahai',
  github_url: 'https://github.com/sarahanderson',
  highlights: [
    'PhD in Computer Science, Stanford University',
    'Published 20+ peer-reviewed papers in top AI conferences',
    'TEDx speaker on "The Future of Ethical AI"',
    'Advisory board member for AI Ethics Coalition'
  ],
  skills: ['Machine Learning', 'AI Ethics', 'Python', 'TensorFlow', 'Research', 'Data Analysis', 'Public Speaking'],
  interests: ['Ethical AI', 'Data Privacy', 'Mentoring', 'Public Speaking', 'Environmental Conservation'],
  experiences: [
    {
      id: '1',
      role: 'Lead AI Ethics Researcher',
      organization_name: 'Tech Innovation Labs',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
      start_date: 'Jan 2022',
      end_date: null,
      is_current: true,
      duration: '2 yrs 3 mos',
      description: 'Leading a team of researchers in developing ethical AI frameworks and guidelines. Spearheading initiatives in responsible AI development and implementation across multiple product lines.',
      skills: ['AI Ethics', 'Team Leadership', 'Research']
    },
    {
      id: '2',
      role: 'Independent Research & World Travel',
      organization_name: 'Self-Directed Study',
      logo: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=100&h=100&fit=crop',
      start_date: 'Jan 2021',
      end_date: 'Dec 2021',
      is_current: false,
      duration: '1 yr',
      description: 'Conducted independent research while traveling through Asia and Europe, studying the cultural implications of AI adoption in different societies. Spent 3 months volunteering in the Amazon rainforest with indigenous communities, learning about traditional knowledge systems and their intersection with modern technology. Published "Cultural Perspectives on AI" in the International Journal of AI Ethics.',
      skills: ['Cross-Cultural Research', 'Field Work', 'Writing']
    },
    {
      id: '3',
      role: 'AI Education Volunteer',
      organization_name: 'Code.org',
      logo: 'https://images.unsplash.com/photo-1559024094-4a1e4495c3c1?w=100&h=100&fit=crop',
      start_date: 'Sep 2020',
      end_date: null,
      is_current: true,
      duration: '3 yrs 6 mos',
      description: 'Teaching AI concepts to underprivileged high school students. Developed curriculum for introducing ethical AI concepts to teenagers, reaching over 500 students across 10 schools.',
      skills: ['Education', 'Curriculum Development', 'Mentoring']
    },
    {
      id: '4',
      role: 'Family Caregiver',
      organization_name: 'Personal Care',
      type: 'personal',
      start_date: 'Mar 2019',
      end_date: 'Dec 2019',
      is_current: false,
      duration: '10 mos',
      description: 'Took a career break to care for a family member with chronic illness. This experience deepened my understanding of healthcare AI applications and patient needs, inspiring my later work on AI accessibility.',
      skills: ['Healthcare', 'Patient Care', 'Empathy']
    },
    {
      id: '5',
      role: 'Senior AI Researcher',
      organization_name: 'AI Research Institute',
      logo: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=100&h=100&fit=crop',
      start_date: 'Jun 2016',
      end_date: 'Feb 2019',
      is_current: false,
      duration: '2 yrs 9 mos',
      description: 'Led research projects in machine learning fairness and algorithmic bias. Published multiple papers in top-tier conferences including NeurIPS, ICML, and FAccT.',
      skills: ['Machine Learning', 'Research', 'Publications']
    }
  ],
  publications: [
    {
      title: 'Ethical Considerations in Machine Learning Models',
      description: 'Published in AI Ethics Journal, 2023',
      link: '#'
    },
    {
      title: 'Fairness Metrics in Neural Networks',
      description: 'ArXiv Preprint, 2023',
      link: '#'
    },
    {
      title: 'Cultural Perspectives on AI: Lessons from Global Communities',
      description: 'International Journal of AI Ethics, 2021',
      link: '#'
    }
  ],
  presentations: [
    {
      title: 'The Future of Ethical AI',
      description: 'TEDx San Francisco, 2023',
      link: '#'
    },
    {
      title: 'Building Trust in AI Systems',
      description: 'AI Conference Keynote, 2022',
      link: '#'
    }
  ],
  resources: [
    {
      title: 'AI Ethics Guidelines',
      description: 'A comprehensive guide to ethical AI development',
      link: '#'
    },
    {
      title: 'Machine Learning Workshop Series',
      description: 'Online course materials and recordings',
      link: '#'
    }
  ]
}

export const mockRecognitions = [
  {
    id: '1',
    from: {
      id: 'emily-chen',
      name: 'Dr. Emily Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    message: 'Sarah\'s work on AI ethics has been transformative for our industry. Her framework for bias detection has helped us build more equitable systems.',
    date: '2024-01-15T10:00:00Z',
    status: 'approved' as const,
    response: 'Thank you so much, Emily! It\'s been a pleasure collaborating with your team.'
  },
  {
    id: '2',
    from: {
      id: 'maria-rodriguez',
      name: 'Maria Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop'
    },
    message: 'I attended Sarah\'s workshop on ethical AI and it completely changed my perspective. Her ability to explain complex concepts in accessible ways is remarkable.',
    date: '2024-01-14T15:30:00Z',
    status: 'approved' as const,
    response: null
  },
  {
    id: '3',
    from: {
      id: 'john-doe',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    message: 'Working with Sarah on the AI Ethics Coalition has been inspiring. Her dedication to making AI accessible and fair for everyone is unmatched.',
    date: '2024-01-13T09:00:00Z',
    status: 'approved' as const,
    response: 'I appreciate your kind words, John. Looking forward to our continued collaboration!'
  },
  {
    id: '4',
    from: {
      id: 'alex-kumar',
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    message: 'Sarah mentored me during my PhD and her guidance was invaluable. She\'s not just a brilliant researcher but also an amazing teacher.',
    date: '2024-01-12T14:00:00Z',
    status: 'pending' as const,
    response: null
  }
]
