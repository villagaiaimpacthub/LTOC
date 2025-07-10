export const currentUser = {
  id: 'sarah-anderson',
  display_name: 'Sarah Anderson',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  email: 'sarah.anderson@example.com'
}

export const profiles = {
  'sarah-anderson': {
    id: 'sarah-anderson',
    display_name: 'Sarah Anderson',
    title: 'AI Research Scientist | Data Ethics Advocate',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    bio: 'Leading research in ethical AI development with a focus on fairness and transparency.',
    long_bio: 'With over a decade of experience in artificial intelligence and machine learning, I specialize in developing ethical AI solutions that prioritize fairness, transparency, and human-centered design.',
    linkedin_url: 'https://linkedin.com/in/sarahanderson',
    twitter_handle: '@sarahai',
    github_url: 'https://github.com/sarahanderson',
    skills: ['Machine Learning', 'AI Ethics', 'Python', 'TensorFlow', 'Research', 'Public Speaking', 'Team Leadership'],
    interests: ['Ethical AI', 'Data Privacy', 'Mentoring', 'Public Speaking', 'Climate Tech', 'Education'],
    experiences: [
      {
        id: '1',
        role: 'Lead AI Ethics Researcher',
        organization_name: 'Tech Innovation Labs',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
        start_date: 'Jan 2022',
        is_current: true,
        description: 'Leading a team of researchers in developing ethical AI frameworks and responsible AI practices. Collaborating with cross-functional teams to implement AI governance policies.',
        skills: ['AI Ethics', 'Team Leadership', 'Research', 'Policy Development']
      },
      {
        id: '2',
        role: 'Independent Research & World Travel',
        organization_name: 'Self-Directed Learning',
        type: 'personal',
        start_date: 'Jan 2021',
        end_date: 'Dec 2021',
        description: 'Took a sabbatical to travel across 15 countries, conducting independent research on global AI adoption patterns. Spent 3 months volunteering with indigenous communities in the Amazon rainforest, learning about traditional knowledge systems and their intersection with modern technology.',
        skills: ['Cross-Cultural Communication', 'Field Research', 'Community Engagement']
      },
      {
        id: '3',
        role: 'AI Education Volunteer',
        organization_name: 'Code.org',
        logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop',
        start_date: 'Jun 2020',
        end_date: 'Dec 2020',
        description: 'Volunteered to teach AI and machine learning concepts to high school students from underrepresented communities. Developed curriculum and mentored over 100 students.',
        skills: ['Teaching', 'Curriculum Development', 'Mentoring', 'Community Outreach']
      },
      {
        id: '4',
        role: 'Family Caregiver',
        organization_name: 'Personal Care',
        type: 'personal',
        start_date: 'Mar 2019',
        end_date: 'Dec 2019',
        description: 'Took a career break to provide full-time care for a family member during their recovery from a serious illness. This experience deepened my understanding of healthcare systems and the potential for AI to improve patient care.',
        skills: ['Healthcare', 'Patient Care', 'Empathy', 'Crisis Management']
      },
      {
        id: '5',
        role: 'Senior AI Researcher',
        organization_name: 'AI Research Institute',
        logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop',
        start_date: 'Jun 2016',
        end_date: 'Feb 2019',
        description: 'Conducted cutting-edge research in deep learning and neural networks. Published 12 peer-reviewed papers and presented at major AI conferences worldwide.',
        skills: ['Deep Learning', 'Research', 'Academic Writing', 'Conference Speaking']
      }
    ],
    knowledge_hub: {
      publications: [
        {
          title: 'Ethical Considerations in AI Development',
          type: 'Paper',
          year: '2023',
          link: '#'
        },
        {
          title: 'Fairness in Machine Learning: A Practical Guide',
          type: 'Book Chapter',
          year: '2022',
          link: '#'
        }
      ],
      presentations: [
        {
          title: 'Building Responsible AI Systems',
          event: 'AI Ethics Summit 2023',
          link: '#'
        },
        {
          title: 'Democratizing AI Education',
          event: 'TEDx Talk',
          link: '#'
        }
      ],
      resources: [
        {
          title: 'AI Ethics Toolkit',
          description: 'Open-source toolkit for implementing ethical AI practices',
          link: '#'
        },
        {
          title: 'ML Fairness Checklist',
          description: 'Comprehensive checklist for ensuring fairness in ML models',
          link: '#'
        }
      ]
    },
    recognitions: [
      {
        id: 'rec1',
        from_user: {
          id: 'john-doe',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
          title: 'Product Manager at TechCorp'
        },
        message: 'Sarah\'s work on ethical AI has been transformative for our organization. Her insights helped us build more inclusive products that serve diverse communities better.',
        date: '2024-01-15',
        status: 'approved',
        response: 'Thank you John! It was a pleasure working with your team on this important initiative.'
      },
      {
        id: 'rec2',
        from_user: {
          id: 'emily-chen',
          name: 'Emily Chen',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
          title: 'PhD Student at Stanford'
        },
        message: 'Sarah mentored me during my research on bias in AI systems. Her guidance was invaluable, and she always made time despite her busy schedule. Truly grateful for her support!',
        date: '2024-01-10',
        status: 'approved'
      },
      {
        id: 'rec3',
        from_user: {
          id: 'michael-smith',
          name: 'Michael Smith',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          title: 'CEO at Ethics AI'
        },
        message: 'Sarah\'s keynote at our conference was the highlight of the event. Her ability to explain complex ethical concepts in accessible ways is remarkable.',
        date: '2023-12-20',
        status: 'approved',
        response: 'It was an honor to speak at your conference, Michael. Looking forward to future collaborations!'
      }
    ]
  }
}

export type Profile = typeof profiles['sarah-anderson']
export type Recognition = typeof profiles['sarah-anderson']['recognitions'][0]