'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://oxjjkyfqtlzizdkylsqp.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_QoxM-Z0gAD2w75h0G1dN_Q_7CTVdECd'
);
/* =========================================================
   VEYLO NETWORKS 1.0
========================================================= */

type Page =
  | 'network'
  | 'people'
  | 'messages'
  | 'offices'
  | 'vbn'
  | 'profile'
  | 'memberProfile'
  | 'coming';

type Project = {
  id: string;
  title: string;
  role: string;
  year: string;
  description: string;
};

type Member = {
  id: string;
  memberNumber: number;
  memberCode: string;
  email: string;
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  avatar: string;
  projects: Project[];
  createdAt: string;
};

type NetworkPost = {
  id: string;
  memberId: string;
  content: string;
  likes: string[];
  createdAt: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  name: string;
  type: 'direct' | 'group';
  members: string[];
  messages: ChatMessage[];
  createdAt: string;
};

type OfficeTask = {
  id: string;
  title: string;
  complete: boolean;
};

type OfficeNote = {
  id: string;
  content: string;
  createdAt: string;
};

type OfficeMeeting = {
  id: string;
  title: string;
  date: string;
  time: string;
};

type Office = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  tasks: OfficeTask[];
  notes: OfficeNote[];
  meetings: OfficeMeeting[];
  createdAt: string;
};

type NewsArticle = {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  publishedAt: string;
};

const STORAGE = {
  members: 'veylo_1_members',
  currentMember: 'veylo_1_current_member',
  posts: 'veylo_1_posts',
  conversations: 'veylo_1_conversations',
  offices: 'veylo_1_offices',
};

/* =========================================================
   MAIN
========================================================= */

export default function Home() {
  const [ready, setReady] = useState(false);

  const [page, setPage] = useState<Page>('network');

  const [members, setMembers] = useState<Member[]>([]);

  const [currentMemberId, setCurrentMemberId] = useState('');

  const [viewedMemberId, setViewedMemberId] = useState('');

  const [posts, setPosts] = useState<NetworkPost[]>([]);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [offices, setOffices] = useState<Office[]>([]);

  /* ACCOUNT */

  const [signupName, setSignupName] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  /* PEOPLE */

  const [peopleSearch, setPeopleSearch] = useState('');

  /* NETWORK */

  const [postText, setPostText] = useState('');

  /* MESSAGES */

  const [selectedConversationId, setSelectedConversationId] = useState('');

  const [messageText, setMessageText] = useState('');

  const [groupName, setGroupName] = useState('');

  const [groupInviteCode, setGroupInviteCode] = useState('');

  /* PROFILE */

  const [profileDraft, setProfileDraft] = useState({
    fullName: '',
    headline: '',
    bio: '',
    location: '',
  });

  const [projectDraft, setProjectDraft] = useState({
    title: '',
    role: '',
    year: '',
    description: '',
  });

  /* OFFICES */

  const [selectedOfficeId, setSelectedOfficeId] = useState('');

  const [officeName, setOfficeName] = useState('');

  const [officeDescription, setOfficeDescription] = useState('');

  const [officeInviteCode, setOfficeInviteCode] = useState('');

  const [newTask, setNewTask] = useState('');

  const [newNote, setNewNote] = useState('');

  const [meetingDraft, setMeetingDraft] = useState({
    title: '',
    date: '',
    time: '',
  });

  /* VBN */

  const [news, setNews] = useState<NewsArticle[]>([]);

  const [newsLoading, setNewsLoading] = useState(false);

  const [newsMessage, setNewsMessage] = useState('');

  /* =====================================================
     STORAGE
  ===================================================== */

  useEffect(() => {
    async function loadVeyloData() {
      try {
        // Load real Veylo members from Supabase
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('member_number', { ascending: true });

        if (error) {
          console.error('Could not load Veylo profiles:', error);
        } else if (profiles) {
          const realMembers: Member[] = profiles.map((profile) => ({
            id: profile.id,
            memberNumber: profile.member_number,
            memberCode: profile.member_code,
            email: profile.email || '',
            fullName: profile.full_name || '',
            headline: profile.headline || '',
            bio: profile.bio || '',
            location: profile.location || '',
            avatar: profile.avatar || '',
            projects: profile.projects || [],
            createdAt: profile.created_at,
          }));

          setMembers(realMembers);
        }

        // Find the currently signed-in Veylo user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setCurrentMemberId(user.id);
        }

        // Keep these local for now
        const storedPosts = localStorage.getItem(STORAGE.posts);

        if (storedPosts) {
          setPosts(JSON.parse(storedPosts));
        }

        if (user) {
          const { data: memberRows, error: memberError } = await supabase
            .from('conversation_members')
            .select('conversation_id')
            .eq('user_id', user.id);

          if (memberError) {
            console.error(
              'Could not load conversation memberships:',
              memberError
            );
          } else if (memberRows) {
            const conversationIds = memberRows.map(
              (row) => row.conversation_id
            );

            if (conversationIds.length > 0) {
              const { data: conversationRows, error: conversationError } =
                await supabase
                  .from('conversations')
                  .select('*')
                  .in('id', conversationIds);

              const { data: allMemberRows, error: allMemberError } =
                await supabase
                  .from('conversation_members')
                  .select('*')
                  .in('conversation_id', conversationIds);

              const { data: messageRows, error: messageError } = await supabase
                .from('messages')
                .select('*')
                .in('conversation_id', conversationIds)
                .order('created_at', { ascending: true });

              if (conversationError || allMemberError || messageError) {
                console.error(
                  'Could not load Veylo conversations:',
                  conversationError,
                  allMemberError,
                  messageError
                );
              } else {
                const loadedConversations: Conversation[] = (
                  conversationRows || []
                ).map((conversation) => {
                  const memberIds = (allMemberRows || [])
                    .filter((row) => row.conversation_id === conversation.id)
                    .map((row) => row.user_id);

                  const otherMember = profiles?.find(
                    (profile) =>
                      memberIds.includes(profile.id) && profile.id !== user.id
                  );

                  const loadedMessages: ChatMessage[] = (messageRows || [])
                    .filter(
                      (message) => message.conversation_id === conversation.id
                    )
                    .map((message) => ({
                      id: message.id,
                      senderId: message.sender_id,
                      content: message.content,
                      createdAt: message.created_at,
                    }));

                  return {
                    id: conversation.id,
                    name:
                      conversation.type === 'group'
                        ? conversation.name || 'Group'
                        : otherMember?.full_name || 'Conversation',

                    type: conversation.type === 'group' ? 'group' : 'direct',
                    members: memberIds,
                    messages: loadedMessages,
                    createdAt: conversation.created_at,
                  };
                });

                setConversations(loadedConversations);
              }
            } else {
              setConversations([]);
            }
          }
        }

        if (user) {
          const { data: officeMemberRows, error: officeMemberError } =
            await supabase
              .from('office_members')
              .select('office_id')
              .eq('user_id', user.id);

          if (officeMemberError) {
            console.error(
              'Could not load office memberships:',
              officeMemberError
            );
          } else {
            const officeIds = (officeMemberRows || []).map(
              (row) => row.office_id
            );

            if (officeIds.length > 0) {
              const { data: officeRows, error: officeError } = await supabase
                .from('offices')
                .select('*')
                .in('id', officeIds);

              const { data: allOfficeMembers, error: membersError } =
                await supabase
                  .from('office_members')
                  .select('*')
                  .in('office_id', officeIds);

              if (officeError || membersError) {
                console.error(
                  'Could not load Veylo offices:',
                  officeError,
                  membersError
                );
              } else {
                const loadedOffices: Office[] = (officeRows || []).map(
                  (office) => ({
                    id: office.id,
                    name: office.name,
                    description: office.description || '',
                    ownerId: office.owner_id,
                    members: (allOfficeMembers || [])
                      .filter((row) => row.office_id === office.id)
                      .map((row) => row.user_id),
                    tasks: office.tasks || [],
                    notes: office.notes || [],
                    meetings: office.meetings || [],
                    createdAt: office.created_at,
                  })
                );

                setOffices(loadedOffices);
              }
            } else {
              setOffices([]);
            }
          }
        }
      } catch (error) {
        console.error('Veylo data could not load.', error);
      }

      setReady(true);
    }

    loadVeyloData();
  }, []);

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(STORAGE.currentMember, currentMemberId);
  }, [currentMemberId, ready]);

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(STORAGE.posts, JSON.stringify(posts));
  }, [posts, ready]);

  /* =====================================================
     DERIVED
  ===================================================== */

  const currentMember = useMemo(
    () => members.find((member) => member.id === currentMemberId) || null,
    [members, currentMemberId]
  );

  const viewedMember = useMemo(
    () => members.find((member) => member.id === viewedMemberId) || null,
    [members, viewedMemberId]
  );

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ) || null,
    [conversations, selectedConversationId]
  );

  const selectedOffice = useMemo(
    () => offices.find((office) => office.id === selectedOfficeId) || null,
    [offices, selectedOfficeId]
  );

  const visibleConversations = useMemo(() => {
    if (!currentMember) return [];

    return conversations.filter((conversation) =>
      conversation.members.includes(currentMember.id)
    );
  }, [conversations, currentMember]);

  const visibleOffices = useMemo(() => {
    if (!currentMember) return [];

    return offices.filter((office) =>
      office.members.includes(currentMember.id)
    );
  }, [offices, currentMember]);

  const filteredPeople = useMemo(() => {
    if (!currentMember) return [];

    const search = peopleSearch.trim().toLowerCase();

    return members.filter((member) => {
      if (member.id === currentMember.id) {
        return false;
      }

      if (!search) return true;

      return (
        member.fullName.toLowerCase().includes(search) ||
        member.memberCode.toLowerCase().includes(search) ||
        member.headline.toLowerCase().includes(search) ||
        member.location.toLowerCase().includes(search)
      );
    });
  }, [members, peopleSearch, currentMember]);

  /* =====================================================
     MEMBER NUMBER
  ===================================================== */

  function formatMemberCode(memberNumber: number) {
    const value = String(memberNumber).padStart(8, '0');

    return (
      value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4, 8)
    );
  }

  function getNextMemberNumber() {
    if (members.length === 0) {
      return 1;
    }

    return Math.max(...members.map((member) => member.memberNumber)) + 1;
  }

  /* =====================================================
     ACCOUNT
  ===================================================== */

  async function createAccount() {
    const fullName = signupName.trim();

    const email = signupEmail.trim().toLowerCase();

    if (!fullName || !email) {
      alert('Enter your name and email.');

      return;
    }

    const emailExists = members.some(
      (member) => member.email.toLowerCase() === email
    );

    if (emailExists) {
      alert('That email is already registered.');

      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    const number = getNextMemberNumber();

    const member: Member = {
      id: crypto.randomUUID(),

      memberNumber: number,

      memberCode: formatMemberCode(number),

      email,

      fullName,

      headline: '',

      bio: '',

      location: '',

      avatar: '',

      projects: [],

      createdAt: new Date().toISOString(),
    };

    setMembers((current) => [...current, member]);

    setCurrentMemberId(member.id);

    setSignupName('');
    setSignupEmail('');

    setPage('profile');
  }

  async function loginAccount() {
    const email = signupEmail.trim().toLowerCase();
  
    if (!email) {
      alert('Enter your email.');
      return;
    }
  
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });
  
    if (error) {
      alert(error.message);
      return;
    }
  
    alert('Check your email for your Veylo login link.');
  }

  function signOut() {
    setCurrentMemberId('');
    setSelectedConversationId('');
    setSelectedOfficeId('');
  }

  function signIntoMember(memberId: string) {
    setCurrentMemberId(memberId);
    setPage('network');
  }

  /* =====================================================
     PROFILE
  ===================================================== */

  useEffect(() => {
    if (!currentMember) return;

    setProfileDraft({
      fullName: currentMember.fullName,

      headline: currentMember.headline,

      bio: currentMember.bio,

      location: currentMember.location,
    });
  }, [currentMemberId]);

  async function saveProfile() {
    if (!currentMember) return;

    const updatedProfile = {
      full_name: profileDraft.fullName.trim(),
      headline: profileDraft.headline.trim(),
      bio: profileDraft.bio.trim(),
      location: profileDraft.location.trim(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', currentMember.id);

    if (error) {
      console.error('Could not save profile:', error);
      alert('Profile could not be saved.');
      return;
    }

    setMembers((current) =>
      current.map((member) =>
        member.id === currentMember.id
          ? {
              ...member,
              fullName: updatedProfile.full_name,
              headline: updatedProfile.headline,
              bio: updatedProfile.bio,
              location: updatedProfile.location,
            }
          : member
      )
    );

    alert('Profile saved.');
  }

  function uploadProfilePicture(file?: File) {
    if (!file || !currentMember) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = String(reader.result || '');

      setMembers((current) =>
        current.map((member) =>
          member.id === currentMember.id
            ? {
                ...member,
                avatar: image,
              }
            : member
        )
      );
    };

    reader.readAsDataURL(file);
  }

  async function addProject() {
    if (!currentMember || !projectDraft.title.trim()) return;

    const project: Project = {
      id: crypto.randomUUID(),
      title: projectDraft.title.trim(),
      role: projectDraft.role.trim(),
      year: projectDraft.year.trim(),
      description: projectDraft.description.trim(),
    };

    const updatedProjects = [...currentMember.projects, project];

    const { error } = await supabase
      .from('profiles')
      .update({ projects: updatedProjects })
      .eq('id', currentMember.id);

    if (error) {
      console.error('Could not save project:', error);
      alert('Project could not be saved.');
      return;
    }

    setMembers((current) =>
      current.map((member) =>
        member.id === currentMember.id
          ? { ...member, projects: updatedProjects }
          : member
      )
    );

    setProjectDraft({
      title: '',
      role: '',
      year: '',
      description: '',
    });
  }

  function removeProject(projectId: string) {
    if (!currentMember) return;

    setMembers((current) =>
      current.map((member) =>
        member.id === currentMember.id
          ? {
              ...member,

              projects: member.projects.filter(
                (project) => project.id !== projectId
              ),
            }
          : member
      )
    );
  }

  function openMemberProfile(member: Member) {
    setViewedMemberId(member.id);

    setPage('memberProfile');
  }

  /* =====================================================
     NETWORK
  ===================================================== */

  function createPost() {
    if (!currentMember || !postText.trim()) {
      return;
    }

    const post: NetworkPost = {
      id: crypto.randomUUID(),

      memberId: currentMember.id,

      content: postText.trim(),

      likes: [],

      createdAt: new Date().toISOString(),
    };

    setPosts((current) => [post, ...current]);

    setPostText('');
  }

  function toggleLike(postId: string) {
    if (!currentMember) return;

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const liked = post.likes.includes(currentMember.id);

        return {
          ...post,

          likes: liked
            ? post.likes.filter((memberId) => memberId !== currentMember.id)
            : [...post.likes, currentMember.id],
        };
      })
    );
  }

  /* =====================================================
     DIRECT CHAT
  ===================================================== */

  async function startDirectChat(otherMember: Member) {
    if (!currentMember) return;

    // Find conversations that the logged-in user belongs to
    const { data: myRows, error: myError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', currentMember.id);

    if (myError) {
      console.error('Could not check conversations:', myError);
      return;
    }

    // Find conversations that the other user belongs to
    const { data: otherRows, error: otherError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', otherMember.id);

    if (otherError) {
      console.error('Could not check other member conversations:', otherError);
      return;
    }

    const myIds = (myRows || []).map((row) => row.conversation_id);
    const otherIds = (otherRows || []).map((row) => row.conversation_id);

    const sharedIds = myIds.filter((id) => otherIds.includes(id));

    // Check whether one of those is already a direct chat
    if (sharedIds.length > 0) {
      const { data: allMembers } = await supabase
        .from('conversation_members')
        .select('*')
        .in('conversation_id', sharedIds);

      const existingConversationId = sharedIds.find((id) => {
        const rows = (allMembers || []).filter(
          (row) => row.conversation_id === id
        );

        return (
          rows.length === 2 &&
          rows.some((row) => row.user_id === currentMember.id) &&
          rows.some((row) => row.user_id === otherMember.id)
        );
      });

      if (existingConversationId) {
        const { data: messageRows } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', existingConversationId)
          .order('created_at', { ascending: true });

        const loadedMessages: ChatMessage[] = (messageRows || []).map(
          (message) => ({
            id: message.id,
            senderId: message.sender_id,
            content: message.content,
            createdAt: message.created_at,
          })
        );

        const existingConversation: Conversation = {
          id: existingConversationId,
          name: otherMember.fullName,
          type: 'direct',
          members: [currentMember.id, otherMember.id],
          messages: loadedMessages,
          createdAt: new Date().toISOString(),
        };

        setConversations((current) => {
          const alreadyLoaded = current.some(
            (conversation) => conversation.id === existingConversationId
          );

          return alreadyLoaded
            ? current.map((conversation) =>
                conversation.id === existingConversationId
                  ? existingConversation
                  : conversation
              )
            : [...current, existingConversation];
        });

        setSelectedConversationId(existingConversationId);
        setPage('messages');
        return;
      }
    }

    // No existing direct chat found, so create one
    const conversationId = crypto.randomUUID();

    const { error: conversationError } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        created_by: currentMember.id,
      });

    if (conversationError) {
      console.error('Could not create conversation:', conversationError);
      alert('Conversation could not be created.');
      return;
    }

    const { error: membersError } = await supabase
      .from('conversation_members')
      .insert([
        {
          conversation_id: conversationId,
          user_id: currentMember.id,
        },
        {
          conversation_id: conversationId,
          user_id: otherMember.id,
        },
      ]);

    if (membersError) {
      console.error('Could not add conversation members:', membersError);
      alert('Conversation members could not be added.');
      return;
    }

    const conversation: Conversation = {
      id: conversationId,
      name: otherMember.fullName,
      type: 'direct',
      members: [currentMember.id, otherMember.id],
      messages: [],
      createdAt: new Date().toISOString(),
    };

    setConversations((current) => [...current, conversation]);
    setSelectedConversationId(conversationId);
    setPage('messages');
  }

  /* =====================================================
     GROUP CHAT
  ===================================================== */

  async function createGroup() {
    if (!currentMember || !groupName.trim()) {
      return;
    }

    const conversationId = crypto.randomUUID();

    const { error: conversationError } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        created_by: currentMember.id,
        name: groupName.trim(),
        type: 'group',
      });

    if (conversationError) {
      console.error('Could not create group:', conversationError);
      alert('Group could not be created.');
      return;
    }

    const { error: memberError } = await supabase
      .from('conversation_members')
      .insert({
        conversation_id: conversationId,
        user_id: currentMember.id,
      });

    if (memberError) {
      console.error('Could not add group creator:', memberError);
      alert('Group could not be created.');
      return;
    }

    const conversation: Conversation = {
      id: conversationId,
      name: groupName.trim(),
      type: 'group',
      members: [currentMember.id],
      messages: [],
      createdAt: new Date().toISOString(),
    };

    setConversations((current) => [...current, conversation]);
    setSelectedConversationId(conversationId);
    setGroupName('');
    setPage('messages');
  }

  async function addMemberToGroup() {
    if (!selectedConversation || selectedConversation.type !== 'group') {
      return;
    }

    const code = groupInviteCode.trim();

    const person = members.find((member) => member.memberCode === code);

    if (!person) {
      alert('No member was found with that Veylo ID.');
      return;
    }

    if (selectedConversation.members.includes(person.id)) {
      alert('That member is already in this group.');
      return;
    }

    const { error } = await supabase.from('conversation_members').insert({
      conversation_id: selectedConversation.id,
      user_id: person.id,
    });

    if (error) {
      console.error('Could not add member to group:', error);
      alert('Member could not be added to the group.');
      return;
    }

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              members: [...conversation.members, person.id],
            }
          : conversation
      )
    );

    setGroupInviteCode('');
  }

  async function sendMessage() {
    if (!currentMember || !selectedConversation || !messageText.trim()) {
      return;
    }

    const messageId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const { error } = await supabase.from('messages').insert({
      id: messageId,
      conversation_id: selectedConversation.id,
      sender_id: currentMember.id,
      content: messageText.trim(),
      created_at: createdAt,
    });

    if (error) {
      console.error('Could not send message:', error);
      alert('Message could not be sent.');
      return;
    }

    const message: ChatMessage = {
      id: messageId,
      senderId: currentMember.id,
      content: messageText.trim(),
      createdAt,
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
            }
          : conversation
      )
    );

    setMessageText('');
  }

  /* =====================================================
     OFFICES
  ===================================================== */

  async function createOffice() {
    if (!currentMember || !officeName.trim()) {
      return;
    }

    const officeId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const { error: officeError } = await supabase.from('offices').insert({
      id: officeId,
      name: officeName.trim(),
      description: officeDescription.trim(),
      owner_id: currentMember.id,
      tasks: [],
      notes: [],
      meetings: [],
      created_at: createdAt,
    });

    if (officeError) {
      console.error('Could not create office:', officeError);
      alert('Office could not be created.');
      return;
    }

    const { error: memberError } = await supabase
      .from('office_members')
      .insert({
        office_id: officeId,
        user_id: currentMember.id,
      });

    if (memberError) {
      console.error('Could not add office owner:', memberError);
      alert('Office could not be created.');
      return;
    }

    const office: Office = {
      id: officeId,
      name: officeName.trim(),
      description: officeDescription.trim(),
      ownerId: currentMember.id,
      members: [currentMember.id],
      tasks: [],
      notes: [],
      meetings: [],
      createdAt,
    };

    setOffices((current) => [...current, office]);
    setSelectedOfficeId(officeId);
    setOfficeName('');
    setOfficeDescription('');
  }

  function inviteOfficeMember() {
    if (!selectedOffice) return;

    const person = members.find(
      (member) => member.memberCode === officeInviteCode.trim()
    );

    if (!person) {
      alert('No Veylo member found with that ID.');

      return;
    }

    setOffices((current) =>
      current.map((office) =>
        office.id === selectedOffice.id
          ? {
              ...office,

              members: office.members.includes(person.id)
                ? office.members
                : [...office.members, person.id],
            }
          : office
      )
    );

    setOfficeInviteCode('');
  }

  async function addOfficeTask() {
    if (!selectedOffice || !newTask.trim()) {
      return;
    }

    const task: OfficeTask = {
      id: crypto.randomUUID(),
      title: newTask.trim(),
      complete: false,
    };

    const updatedTasks = [...selectedOffice.tasks, task];

    const { error } = await supabase
      .from('offices')
      .update({
        tasks: updatedTasks,
      })
      .eq('id', selectedOffice.id);

    if (error) {
      console.error('Could not save office task:', error);
      alert('Task could not be saved.');
      return;
    }

    setOffices((current) =>
      current.map((office) =>
        office.id === selectedOffice.id
          ? {
              ...office,
              tasks: updatedTasks,
            }
          : office
      )
    );

    setNewTask('');
  }

  function toggleOfficeTask(taskId: string) {
    if (!selectedOffice) return;

    setOffices((current) =>
      current.map((office) =>
        office.id === selectedOffice.id
          ? {
              ...office,

              tasks: office.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      complete: !task.complete,
                    }
                  : task
              ),
            }
          : office
      )
    );
  }

  function addOfficeNote() {
    if (!selectedOffice || !newNote.trim()) {
      return;
    }

    const note: OfficeNote = {
      id: crypto.randomUUID(),

      content: newNote.trim(),

      createdAt: new Date().toISOString(),
    };

    setOffices((current) =>
      current.map((office) =>
        office.id === selectedOffice.id
          ? {
              ...office,

              notes: [note, ...office.notes],
            }
          : office
      )
    );

    setNewNote('');
  }

  function scheduleMeeting() {
    if (
      !selectedOffice ||
      !meetingDraft.title.trim() ||
      !meetingDraft.date ||
      !meetingDraft.time
    ) {
      return;
    }

    const meeting: OfficeMeeting = {
      id: crypto.randomUUID(),

      title: meetingDraft.title.trim(),

      date: meetingDraft.date,

      time: meetingDraft.time,
    };

    setOffices((current) =>
      current.map((office) =>
        office.id === selectedOffice.id
          ? {
              ...office,

              meetings: [...office.meetings, meeting],
            }
          : office
      )
    );

    setMeetingDraft({
      title: '',
      date: '',
      time: '',
    });
  }

  /* =====================================================
     VBN
  ===================================================== */

  async function loadNews() {
    setNewsLoading(true);
    setNewsMessage('');

    try {
      const response = await fetch('/api/vbn');

      const data = await response.json();

      setNews(data.articles || []);

      if (!data.connected) {
        setNewsMessage(
          data.message || 'VBN news provider is not connected yet.'
        );
      }
    } catch {
      setNews([]);
      setNewsMessage('The VBN news service is not connected yet.');
    }

    setNewsLoading(false);
  }

  useEffect(() => {
    if (page === 'vbn' && news.length === 0 && !newsMessage) {
      loadNews();
    }
  }, [page]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (!ready) {
    return (
      <main className="loadingScreen">
        <img
          src="/Veylo_Networks_White_Transparent.png"
          alt="Veylo Networks"
          className="loadingLogo"
        />

        <span>Loading Veylo Networks</span>
      </main>
    );
  }

  /* =====================================================
     ACCOUNT SCREEN
  ===================================================== */

  if (!currentMember) {
    return (
      <main className="authPage">
        <section className="authCard">
          <img
            src="/Veylo_Networks_White_Transparent.png"
            alt="Veylo Networks"
            className="authLogo"
          />

          <span className="pill">VEYLO 1.0</span>

          <h1>Join Veylo Networks</h1>

          <p className="muted">
            Connect with business people, build your professional profile and
            work together through Veylo.
          </p>

          <div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '12px',
  }}
>
  <button
    type="button"
    className={authMode === 'signup' ? 'primary' : 'field'}
    onClick={() => setAuthMode('signup')}
  >
    Sign Up
  </button>

  <button
    type="button"
    className={authMode === 'login' ? 'primary' : 'field'}
    onClick={() => setAuthMode('login')}
  >
    Log In
  </button>
</div>

{authMode === 'signup' && (
  <input
    className="field"
    placeholder="Full name"
    value={signupName}
    onChange={(event) => setSignupName(event.target.value)}
  />
)}

<input
  className="field"
  type="email"
  placeholder="Email address"
  value={signupEmail}
  onChange={(event) => setSignupEmail(event.target.value)}
/>

<button
  className="primary full"
  onClick={authMode === 'signup' ? createAccount : loginAccount}
>
  {authMode === 'signup' ? 'Create Veylo Account' : 'Log In'}
</button>

          {members.length > 0 && (
            <div className="existingMembers">
              <span className="small muted">
                Existing profiles on this device
              </span>

              {members.map((member) => (
                <button
                  key={member.id}
                  className="memberLogin"
                  onClick={() => signIntoMember(member.id)}
                >
                  <Avatar member={member} />

                  <div>
                    <strong>{member.fullName}</strong>

                    <small>{member.memberCode}</small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  /* =====================================================
     APP
  ===================================================== */

  return (
    <main className="app">
      <aside className="sidebar">
        <div>
          <img
            src="/Veylo_Networks_White_Transparent.png"
            alt="Veylo Networks"
            className="logo"
          />

          <span className="pill">VEYLO 1.0</span>

          <nav>
            <NavButton
              active={page === 'network'}
              onClick={() => setPage('network')}
            >
              Network
            </NavButton>

            <NavButton
              active={page === 'people' || page === 'memberProfile'}
              onClick={() => setPage('people')}
            >
              People
            </NavButton>

            <NavButton
              active={page === 'messages'}
              onClick={() => setPage('messages')}
            >
              Messages
            </NavButton>

            <NavButton
              active={page === 'offices'}
              onClick={() => setPage('offices')}
            >
              Offices
            </NavButton>

            <NavButton active={page === 'vbn'} onClick={() => setPage('vbn')}>
              VBN
            </NavButton>

            <NavButton
              active={page === 'profile'}
              onClick={() => setPage('profile')}
            >
              My Profile
            </NavButton>

            <NavButton
              active={page === 'coming'}
              onClick={() => setPage('coming')}
            >
              Coming Soon
            </NavButton>
          </nav>
        </div>

        <div className="sidebarBottom">
          <div className="sidebarMember">
            <Avatar member={currentMember} />

            <div className="sidebarMemberText">
              <strong>{currentMember.fullName}</strong>

              <span>{currentMember.headline || 'Veylo Member'}</span>

              <small>{currentMember.memberCode}</small>
            </div>
          </div>

          <button className="signOutButton" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">VEYLO NETWORKS</span>

            <h1>{pageTitle(page)}</h1>
          </div>

          <button className="avatarButton" onClick={() => setPage('profile')}>
            <Avatar member={currentMember} />
          </button>
        </header>

        <div className="content">
          {/* NETWORK */}

          {page === 'network' && (
            <section className="networkColumn">
              <div className="glass composer">
                <textarea
                  value={postText}
                  onChange={(event) => setPostText(event.target.value)}
                  placeholder="Share something with the Veylo network..."
                />

                <div className="composerFooter">
                  <span className="muted small">
                    Ideas • progress • opportunities • questions
                  </span>

                  <button className="primary" onClick={createPost}>
                    Post
                  </button>
                </div>
              </div>

              {posts.length === 0 ? (
                <EmptyState
                  title="The Veylo network is ready."
                  text="There are no posts yet."
                />
              ) : (
                posts.map((post) => {
                  const author = members.find(
                    (member) => member.id === post.memberId
                  );

                  if (!author) {
                    return null;
                  }

                  const liked = post.likes.includes(currentMember.id);

                  return (
                    <article className="glass postCard" key={post.id}>
                      <div className="memberHeader">
                        <button
                          className="avatarButton"
                          onClick={() => openMemberProfile(author)}
                        >
                          <Avatar member={author} />
                        </button>

                        <div>
                          <button
                            className="memberNameButton"
                            onClick={() => openMemberProfile(author)}
                          >
                            {author.fullName}
                          </button>

                          <span className="muted small">
                            {author.headline || 'Veylo Member'}
                          </span>

                          <MemberCode code={author.memberCode} />
                        </div>
                      </div>

                      <p className="postContent">{post.content}</p>

                      <button
                        className={liked ? 'likeButton liked' : 'likeButton'}
                        onClick={() => toggleLike(post.id)}
                      >
                        ♥ {post.likes.length}
                      </button>
                    </article>
                  );
                })
              )}
            </section>
          )}

          {/* PEOPLE */}

          {page === 'people' && (
            <>
              <section className="glass searchPanel">
                <input
                  className="field"
                  placeholder="Search name, profession, location or Veylo ID..."
                  value={peopleSearch}
                  onChange={(event) => setPeopleSearch(event.target.value)}
                />

                <p className="muted small">
                  Veylo member IDs use the format 00-00-0001.
                </p>
              </section>

              {filteredPeople.length === 0 ? (
                <EmptyState
                  title="No other members yet."
                  text="New Veylo members will appear here once they join."
                />
              ) : (
                <div className="peopleGrid">
                  {filteredPeople.map((member) => (
                    <article className="glass personCard" key={member.id}>
                      <div className="memberHeader">
                        <Avatar member={member} />

                        <div className="memberText">
                          <strong>{member.fullName}</strong>

                          <span>{member.headline || 'Veylo Member'}</span>
                        </div>
                      </div>

                      <MemberCode code={member.memberCode} />

                      <p className="personBio muted">
                        {member.bio || 'No bio added yet.'}
                      </p>

                      <div className="cardActions">
                        <button
                          className="secondary"
                          onClick={() => openMemberProfile(member)}
                        >
                          Profile
                        </button>

                        <button
                          className="primary"
                          onClick={() => startDirectChat(member)}
                        >
                          Message
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* MEMBER PROFILE */}

          {page === 'memberProfile' && viewedMember && (
            <section className="memberProfilePage">
              <button className="backButton" onClick={() => setPage('people')}>
                ← Back to People
              </button>

              <div className="glass publicProfileHero">
                <Avatar member={viewedMember} large />

                <div>
                  <h2>{viewedMember.fullName}</h2>

                  <p className="profileHeadline">
                    {viewedMember.headline || 'Veylo Member'}
                  </p>

                  <div className="profileMetadata">
                    {viewedMember.location && (
                      <span>{viewedMember.location}</span>
                    )}

                    <MemberCode code={viewedMember.memberCode} />
                  </div>

                  <p className="muted profileBio">
                    {viewedMember.bio || 'No bio added yet.'}
                  </p>

                  <button
                    className="primary"
                    onClick={() => startDirectChat(viewedMember)}
                  >
                    Message
                  </button>
                </div>
              </div>

              <h2 className="sectionHeading">Past Projects</h2>

              {viewedMember.projects.length === 0 ? (
                <EmptyState title="No projects added yet." text="" />
              ) : (
                viewedMember.projects.map((project) => (
                  <article className="glass projectCard" key={project.id}>
                    <h3>{project.title}</h3>

                    <span className="muted small">
                      {project.role}

                      {project.year ? ` • ${project.year}` : ''}
                    </span>

                    <p className="muted">{project.description}</p>
                  </article>
                ))
              )}
            </section>
          )}

          {/* MESSAGES */}

          {page === 'messages' && (
            <div className="twoColumnLayout">
              <aside className="glass panel">
                <h3>Messages</h3>

                <div className="stack">
                  <input
                    className="field"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                  />

                  <button className="primary full" onClick={createGroup}>
                    Create Group
                  </button>
                </div>

                <div className="list">
                  {visibleConversations.map((conversation) => {
                    const displayName = getConversationName(
                      conversation,
                      currentMember,
                      members
                    );

                    return (
                      <button
                        key={conversation.id}
                        className={
                          selectedConversationId === conversation.id
                            ? 'listButton active'
                            : 'listButton'
                        }
                        onClick={() =>
                          setSelectedConversationId(conversation.id)
                        }
                      >
                        <strong>{displayName}</strong>

                        <span>
                          {conversation.type === 'group'
                            ? `${conversation.members.length} members`
                            : 'Direct message'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="glass chatPanel">
                {!selectedConversation ? (
                  <EmptyState
                    title="No conversation selected."
                    text="Message a member from the People page or create a group."
                  />
                ) : (
                  <>
                    <div className="panelHeader">
                      <div>
                        <strong>
                          {getConversationName(
                            selectedConversation,
                            currentMember,
                            members
                          )}
                        </strong>

                        <span className="muted small">
                          {selectedConversation.type === 'group'
                            ? `${selectedConversation.members.length} members`
                            : 'Direct message'}
                        </span>
                      </div>

                      {selectedConversation.type === 'group' && (
                        <div className="inlineForm">
                          <input
                            className="field smallField"
                            placeholder="Veylo ID"
                            value={groupInviteCode}
                            onChange={(event) =>
                              setGroupInviteCode(event.target.value)
                            }
                          />

                          <button
                            className="secondary"
                            onClick={addMemberToGroup}
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="messageArea">
                      {selectedConversation.messages.length === 0 ? (
                        <div className="emptyConversation">
                          No messages yet.
                        </div>
                      ) : (
                        selectedConversation.messages.map((message) => {
                          const mine = message.senderId === currentMember.id;

                          const sender = members.find(
                            (member) => member.id === message.senderId
                          );

                          return (
                            <div
                              className={
                                mine ? 'messageBubble mine' : 'messageBubble'
                              }
                              key={message.id}
                            >
                              {selectedConversation.type === 'group' &&
                                !mine && (
                                  <small className="messageSender">
                                    {sender?.fullName || 'Member'}
                                  </small>
                                )}

                              {message.content}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="messageComposer">
                      <input
                        className="field"
                        placeholder="Write a message..."
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            sendMessage();
                          }
                        }}
                      />

                      <button className="primary" onClick={sendMessage}>
                        Send
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {/* OFFICES */}

          {page === 'offices' && (
            <div className="twoColumnLayout">
              <aside className="glass panel">
                <h3>Internal Offices</h3>

                <div className="stack">
                  <input
                    className="field"
                    placeholder="Office / project name"
                    value={officeName}
                    onChange={(event) => setOfficeName(event.target.value)}
                  />

                  <textarea
                    className="field smallTextarea"
                    placeholder="Description"
                    value={officeDescription}
                    onChange={(event) =>
                      setOfficeDescription(event.target.value)
                    }
                  />

                  <button className="primary full" onClick={createOffice}>
                    Create Office
                  </button>
                </div>

                <div className="list">
                  {visibleOffices.map((office) => (
                    <button
                      key={office.id}
                      className={
                        office.id === selectedOfficeId
                          ? 'listButton active'
                          : 'listButton'
                      }
                      onClick={() => setSelectedOfficeId(office.id)}
                    >
                      <strong>{office.name}</strong>

                      <span>{office.members.length} members</span>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="officeMain">
                {!selectedOffice ? (
                  <EmptyState
                    title="No office selected."
                    text="Create an office for a business, project or team."
                  />
                ) : (
                  <>
                    <section className="glass officeHero">
                      <div>
                        <span className="eyebrow">INTERNAL OFFICE</span>

                        <h2>{selectedOffice.name}</h2>

                        <p className="muted">{selectedOffice.description}</p>
                      </div>

                      <div className="inlineForm">
                        <input
                          className="field smallField"
                          placeholder="Member ID"
                          value={officeInviteCode}
                          onChange={(event) =>
                            setOfficeInviteCode(event.target.value)
                          }
                        />

                        <button
                          className="secondary"
                          onClick={inviteOfficeMember}
                        >
                          Invite
                        </button>
                      </div>
                    </section>

                    <div className="officeGrid">
                      <section className="glass officeSection">
                        <h3>Tasks</h3>

                        <div className="inlineForm">
                          <input
                            className="field"
                            placeholder="New task"
                            value={newTask}
                            onChange={(event) => setNewTask(event.target.value)}
                          />

                          <button className="primary" onClick={addOfficeTask}>
                            Add
                          </button>
                        </div>

                        <div className="officeItems">
                          {selectedOffice.tasks.map((task) => (
                            <button
                              key={task.id}
                              className={
                                task.complete ? 'task complete' : 'task'
                              }
                              onClick={() => toggleOfficeTask(task.id)}
                            >
                              <span>{task.complete ? '✓' : '○'}</span>

                              {task.title}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="glass officeSection">
                        <h3>Meetings</h3>

                        <div className="stack">
                          <input
                            className="field"
                            placeholder="Meeting title"
                            value={meetingDraft.title}
                            onChange={(event) =>
                              setMeetingDraft((current) => ({
                                ...current,

                                title: event.target.value,
                              }))
                            }
                          />

                          <div className="split">
                            <input
                              className="field"
                              type="date"
                              value={meetingDraft.date}
                              onChange={(event) =>
                                setMeetingDraft((current) => ({
                                  ...current,

                                  date: event.target.value,
                                }))
                              }
                            />

                            <input
                              className="field"
                              type="time"
                              value={meetingDraft.time}
                              onChange={(event) =>
                                setMeetingDraft((current) => ({
                                  ...current,

                                  time: event.target.value,
                                }))
                              }
                            />
                          </div>

                          <button className="primary" onClick={scheduleMeeting}>
                            Schedule Meeting
                          </button>
                        </div>

                        <div className="officeItems">
                          {selectedOffice.meetings.map((meeting) => (
                            <article className="meeting" key={meeting.id}>
                              <strong>{meeting.title}</strong>

                              <span className="muted small">
                                {meeting.date} at {meeting.time}
                              </span>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section className="glass officeSection officeNotes">
                        <h3>Office Notes</h3>

                        <textarea
                          className="field noteBox"
                          placeholder="Add notes, decisions, updates or project information..."
                          value={newNote}
                          onChange={(event) => setNewNote(event.target.value)}
                        />

                        <button className="primary" onClick={addOfficeNote}>
                          Add Note
                        </button>

                        <div className="officeItems">
                          {selectedOffice.notes.map((note) => (
                            <article className="note" key={note.id}>
                              {note.content}
                            </article>
                          ))}
                        </div>
                      </section>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {/* VBN */}

          {page === 'vbn' && (
            <>
              <div className="sectionTop">
                <div>
                  <span className="eyebrow">VEYLO BUSINESS NEWS</span>

                  <h2>VBN</h2>

                  <p className="muted">
                    Business, startup, technology and economic news.
                  </p>
                </div>

                <button className="secondary" onClick={loadNews}>
                  Refresh
                </button>
              </div>

              {newsLoading ? (
                <EmptyState title="Loading VBN..." text="" />
              ) : news.length === 0 ? (
                <EmptyState
                  title="VBN is ready."
                  text={
                    newsMessage ||
                    'Connect the live business news provider to begin publishing headlines.'
                  }
                />
              ) : (
                <div className="newsGrid">
                  {news.map((article) => (
                    <article className="glass newsCard" key={article.id}>
                      <span className="newsSource">{article.source}</span>

                      <h3>{article.title}</h3>

                      <p className="muted">{article.summary}</p>

                      <span className="newsDate">{article.publishedAt}</span>

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="newsLink"
                      >
                        Read full story →
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* PERSONAL PROFILE */}

          {page === 'profile' && (
            <div className="profileGrid">
              <section className="glass profileEditor">
                <div className="profileHero">
                  <Avatar member={currentMember} large />

                  <div>
                    <span className="eyebrow">PERSONAL PROFILE</span>

                    <h2>{currentMember.fullName}</h2>

                    <MemberCode code={currentMember.memberCode} larger />

                    <p className="muted small">Permanent Veylo member ID.</p>
                  </div>
                </div>

                <label className="uploadButton">
                  Change Profile Picture
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      uploadProfilePicture(event.target.files?.[0])
                    }
                  />
                </label>

                <div className="stack">
                  <FieldLabel label="Full name">
                    <input
                      className="field"
                      value={profileDraft.fullName}
                      onChange={(event) =>
                        setProfileDraft((current) => ({
                          ...current,

                          fullName: event.target.value,
                        }))
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Professional headline">
                    <input
                      className="field"
                      placeholder="Founder • Investor • Designer..."
                      value={profileDraft.headline}
                      onChange={(event) =>
                        setProfileDraft((current) => ({
                          ...current,

                          headline: event.target.value,
                        }))
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Location">
                    <input
                      className="field"
                      placeholder="Dublin, Ireland"
                      value={profileDraft.location}
                      onChange={(event) =>
                        setProfileDraft((current) => ({
                          ...current,

                          location: event.target.value,
                        }))
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Bio">
                    <textarea
                      className="field bioInput"
                      placeholder="Tell the Veylo network about yourself..."
                      value={profileDraft.bio}
                      onChange={(event) =>
                        setProfileDraft((current) => ({
                          ...current,

                          bio: event.target.value,
                        }))
                      }
                    />
                  </FieldLabel>

                  <button className="primary" onClick={saveProfile}>
                    Save Profile
                  </button>
                </div>
              </section>

              <section className="glass projectsPanel">
                <span className="eyebrow">PROFESSIONAL HISTORY</span>

                <h2>Past Projects</h2>

                <p className="muted">
                  Show the businesses, products and projects you have worked on.
                </p>

                <div className="projectForm">
                  <input
                    className="field"
                    placeholder="Project name"
                    value={projectDraft.title}
                    onChange={(event) =>
                      setProjectDraft((current) => ({
                        ...current,

                        title: event.target.value,
                      }))
                    }
                  />

                  <input
                    className="field"
                    placeholder="Your role"
                    value={projectDraft.role}
                    onChange={(event) =>
                      setProjectDraft((current) => ({
                        ...current,

                        role: event.target.value,
                      }))
                    }
                  />

                  <input
                    className="field"
                    placeholder="Year"
                    value={projectDraft.year}
                    onChange={(event) =>
                      setProjectDraft((current) => ({
                        ...current,

                        year: event.target.value,
                      }))
                    }
                  />

                  <textarea
                    className="field projectDescription"
                    placeholder="What did you work on?"
                    value={projectDraft.description}
                    onChange={(event) =>
                      setProjectDraft((current) => ({
                        ...current,

                        description: event.target.value,
                      }))
                    }
                  />

                  <button className="primary" onClick={addProject}>
                    Add Project
                  </button>
                </div>

                <div className="projectList">
                  {currentMember.projects.map((project) => (
                    <article className="projectRow" key={project.id}>
                      <div>
                        <strong>{project.title}</strong>

                        <span className="muted small">
                          {project.role}

                          {project.year ? ` • ${project.year}` : ''}
                        </span>

                        <p className="muted">{project.description}</p>
                      </div>

                      <button
                        className="removeButton"
                        onClick={() => removeProject(project.id)}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* COMING SOON */}

          {page === 'coming' && (
            <>
              <section className="glass comingHero">
                <span className="pill">VEYLO ROADMAP</span>

                <h2>What&apos;s next for Veylo</h2>

                <p className="muted">
                  Veylo 1.0 establishes the core professional network, VBN and
                  internal business offices.
                </p>
              </section>

              <div className="comingGrid">
                <ComingCard
                  title="Business Marketplace"
                  text="Business listings, buyers, sellers and acquisition opportunities."
                />

                <ComingCard
                  title="Verified Points"
                  text="A verified reputation and contribution system across Veylo."
                />

                <ComingCard
                  title="Integrated Video Meetings"
                  text="Live video calls, screen sharing and office presence."
                />

                <ComingCard
                  title="Business Transactions"
                  text="Payments and commercial transaction infrastructure."
                />

                <ComingCard
                  title="Veylo Intelligence"
                  text="Business discovery, matching and intelligent network tools."
                />

                <ComingCard
                  title="Advanced Office Tools"
                  text="Whiteboards, files, live collaboration and deeper project management."
                />
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={active ? 'navButton active' : 'navButton'}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Avatar({
  member,
  large = false,
}: {
  member: Member;
  large?: boolean;
}) {
  const initials =
    member.fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'V';

  if (member.avatar) {
    return (
      <img
        src={member.avatar}
        alt={member.fullName}
        className={large ? 'avatar avatarLarge' : 'avatar'}
      />
    );
  }

  return (
    <div className={large ? 'avatar avatarLarge' : 'avatar'}>{initials}</div>
  );
}

function MemberCode({
  code,
  larger = false,
}: {
  code: string;
  larger?: boolean;
}) {
  return (
    <span className={larger ? 'memberCode larger' : 'memberCode'}>{code}</span>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <section className="glass emptyState">
      <h3>{title}</h3>

      {text && <p>{text}</p>}
    </section>
  );
}

function ComingCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="glass comingCard">
      <span className="pill">COMING SOON</span>

      <h3>{title}</h3>

      <p className="muted">{text}</p>
    </article>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="fieldLabel">
      <span>{label}</span>

      {children}
    </label>
  );
}

function getConversationName(
  conversation: Conversation,
  currentMember: Member,
  members: Member[]
) {
  if (conversation.type === 'group') {
    return conversation.name;
  }

  const otherMemberId = conversation.members.find(
    (memberId) => memberId !== currentMember.id
  );

  return (
    members.find((member) => member.id === otherMemberId)?.fullName ||
    'Direct Message'
  );
}

function pageTitle(page: Page) {
  const titles: Record<Page, string> = {
    network: 'Network',

    people: 'People',

    messages: 'Messages',

    offices: 'Internal Offices',

    vbn: 'Veylo Business News',

    profile: 'My Profile',

    memberProfile: 'Member Profile',

    coming: 'Coming Soon',
  };

  return titles[page];
}
