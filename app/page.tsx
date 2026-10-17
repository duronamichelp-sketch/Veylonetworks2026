'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import VbnNewsroom, { type VbnArticle } from './components/VbnNewsroom';
import ExpandableText from './components/ExpandableText';
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

type MobileIconName = 'network' | 'people' | 'messages' | 'offices' | 'vbn' | 'profile';

const MOBILE_TABS: Array<{ id: Page; label: string; icon: MobileIconName }> = [
  { id: 'network', label: 'Network', icon: 'network' },
  { id: 'people', label: 'People', icon: 'people' },
  { id: 'messages', label: 'Chats', icon: 'messages' },
  { id: 'offices', label: 'Offices', icon: 'offices' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

type Project = {
  id: string;
  title: string;
  role: string;
  year: string;
  description: string;
  website?: string;
};

type FollowRelationship = {
  followerId: string;
  followedId: string;
};

type Member = {
  id: string;
  memberNumber: number;
  memberCode: string;
  isVerified?: boolean;
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
  attachmentPath?: string;
  attachmentName?: string;
  attachmentType?: string;
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
  sending?: boolean;
  attachmentPath?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
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

type NewsArticle = VbnArticle;

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileNavPosition, setMobileNavPosition] = useState<'right' | 'left' | 'bottom'>('right');
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [profileProjectsOpen, setProfileProjectsOpen] = useState(false);
  const [profileAddProjectOpen, setProfileAddProjectOpen] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('veylo_mobile_nav_position');
    if (stored === 'right' || stored === 'left' || stored === 'bottom') setMobileNavPosition(stored);
  }, []);
  function changeMobileNavPosition(position: 'right' | 'left' | 'bottom') {
    setMobileNavPosition(position);
    setMobileNavCollapsed(false);
    localStorage.setItem('veylo_mobile_nav_position', position);
  }

  const [members, setMembers] = useState<Member[]>([]);
  const [follows, setFollows] = useState<FollowRelationship[]>([]);
  const [followBusyId, setFollowBusyId] = useState('');

  const [currentMemberId, setCurrentMemberId] = useState('');

  const [viewedMemberId, setViewedMemberId] = useState('');

  const [posts, setPosts] = useState<NetworkPost[]>([]);
  const [postSaves,setPostSaves]=useState<string[]>([]);
  const [postComments,setPostComments]=useState<{id:string;post_id:string;user_id:string;content:string}[]>([]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [readReceipts, setReadReceipts] = useState<Record<string, string>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [sendingMessage, setSendingMessage] = useState(false);
  const knownConversationIdsRef = useRef<Set<string>>(new Set());
  const sendInFlightRef = useRef(false);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);
  const isTypingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [offices, setOffices] = useState<Office[]>([]);

  /* ACCOUNT */

  const [signupName, setSignupName] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  /* PEOPLE */

  const [peopleSearch, setPeopleSearch] = useState('');

  /* NETWORK */

  const [postText, setPostText] = useState('');
  const [postFile, setPostFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [networkToolsOpen, setNetworkToolsOpen] = useState(false);
  const networkToolsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!networkToolsOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!networkToolsRef.current?.contains(event.target as Node)) setNetworkToolsOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [networkToolsOpen]);
  const postFileInput = useRef<HTMLInputElement>(null);

  /* MESSAGES */

  const [selectedConversationId, setSelectedConversationId] = useState('');

  const [messageText, setMessageText] = useState('');
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [groupName, setGroupName] = useState('');

  const [groupInviteCode, setGroupInviteCode] = useState('');

  /* PROFILE */

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarSaveMessage, setAvatarSaveMessage] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [profileDraft, setProfileDraft] = useState({
    fullName: '',
    headline: '',
    bio: '',
    location: '',
  });

  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [confirmAccountPassword, setConfirmAccountPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [projectDraft, setProjectDraft] = useState({
    title: '',
    role: '',
    year: '',
    description: '',
    website: '',
  });
  const [projectLinkEdits, setProjectLinkEdits] = useState<Record<string, string>>({});
  const [projectLinkSavingId, setProjectLinkSavingId] = useState('');
  const [projectLinkNotice, setProjectLinkNotice] = useState('');

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
  const [newsUpdatedAt, setNewsUpdatedAt] = useState('');

  async function refreshInbox(
    memberId: string,
    loadedProfiles: Array<{ id: string; full_name: string }> = []
  ) {
    const { data: mine, error: membershipError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', memberId);
    if (membershipError) {
      console.error('Could not refresh Veylo inbox memberships:', membershipError);
      return;
    }

    const conversationIds = (mine || []).map((row) => row.conversation_id);
    if (!conversationIds.length) {
      setConversations([]);
      setReadReceipts({});
      return;
    }

    const [
      { data: chats, error: chatsError },
      { data: chatMembers, error: membersError },
      { data: messageRows, error: messagesError },
      { data: readRows, error: readsError },
    ] = await Promise.all([
      supabase.from('conversations').select('*').in('id', conversationIds),
      supabase.from('conversation_members').select('*').in('conversation_id', conversationIds),
      supabase.from('messages').select('*').in('conversation_id', conversationIds)
        .order('created_at', { ascending: true }),
      supabase.from('conversation_reads').select('conversation_id, last_read_at')
        .eq('user_id', memberId),
    ]);

    if (chatsError || membersError || messagesError || readsError) {
      console.error('Could not refresh Veylo inbox:', chatsError, membersError, messagesError, readsError);
      return;
    }

    const loaded: Conversation[] = (chats || []).map((chat) => {
      const ids: string[] = (chatMembers || [])
        .filter((row) => row.conversation_id === chat.id)
        .map((row) => row.user_id);
      const partner = loadedProfiles.find(
        (member) => ids.includes(member.id) && member.id !== memberId
      );
      const messages: ChatMessage[] = (messageRows || [])
        .filter((row) => row.conversation_id === chat.id)
        .map((row) => ({
          id: row.id,
          senderId: row.sender_id,
          content: row.content,
          attachmentPath: row.attachment_path || undefined,
          attachmentName: row.attachment_name || undefined,
          attachmentType: row.attachment_type || undefined,
          attachmentSize: row.attachment_size || undefined,
          createdAt: row.created_at,
        }));

      return {
        id: chat.id,
        name: chat.type === 'group' ? chat.name || 'Group' : partner?.full_name || 'Direct Message',
        type: chat.type === 'group' ? 'group' : 'direct',
        members: ids,
        messages,
        createdAt: chat.created_at,
      };
    });

    setConversations((current) => loaded.map((chat) => {
      const oldChat = current.find((item) => item.id === chat.id);
      const awaiting = (oldChat?.messages || []).filter(
        (message) => message.sending && !chat.messages.some((saved) => saved.id === message.id)
      );
      return {
        ...chat,
        name: chat.type === 'direct'
          ? oldChat?.name || chat.name
          : chat.name,
        messages: [...chat.messages, ...awaiting]
          .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
      };
    }));

    setReadReceipts((current) => {
      const next = { ...current };
      for (const row of readRows || []) {
        const previousTime = Date.parse(next[row.conversation_id] || '') || 0;
        const serverTime = Date.parse(row.last_read_at) || 0;
        if (serverTime >= previousTime) next[row.conversation_id] = row.last_read_at;
      }
      return next;
    });
  }

  async function markConversationRead(conversationId: string) {
    const { data, error } = await supabase.rpc('mark_conversation_read', {
      p_conversation_id: conversationId,
    });

    if (error) {
      console.error('Could not mark conversation as read:', error);
      return;
    }
    if (typeof data === 'string') {
      setReadReceipts((current) => {
        const previous = Date.parse(current[conversationId] || '') || 0;
        if (Date.parse(data) < previous) return current;
        return { ...current, [conversationId]: data };
      });
    }
  }

  function playSentMessagePop() {
    // Only create audio after an actual send interaction; mobile browsers may
    // otherwise block audio until a user gesture.
    try {
      const AudioContextConstructor = window.AudioContext;
      if (!AudioContextConstructor) return;
      const context = audioContextRef.current || new AudioContextConstructor();
      audioContextRef.current = context;
      if (context.state === 'suspended') void context.resume();
      const osc = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, start);
      osc.frequency.exponentialRampToValueAtTime(350, start + 0.105);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.09, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.115);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(start);
      osc.stop(start + 0.12);
    } catch (error) {
      console.warn('Sound unavailable in this browser:', error);
    }
  }

  function broadcastTyping(isTyping: boolean) {
    const channel = typingChannelRef.current;
    if (!channel || !currentMemberId) return;

    if (isTyping) {
      const now = Date.now();
      if (isTypingRef.current && now - lastTypingSentRef.current < 900) return;
      lastTypingSentRef.current = now;
    } else if (!isTypingRef.current) {
      return;
    }

    isTypingRef.current = isTyping;
    void channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { memberId: currentMemberId, isTyping },
    });
  }

  /* =====================================================
     STORAGE
  ===================================================== */

  useEffect(() => {
    // Password reset URLs establish an authenticated recovery session.
    // A regular login does not send an email.
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (
      params.get('recovery') === '1' ||
      params.get('type') === 'recovery' ||
      hashParams.get('type') === 'recovery'
    ) {
      setIsRecoveryMode(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadVeyloData() {
      try {
        // Resolve the actual Supabase account first; profile RLS requires it.
        // Never use a member ID from local storage to authenticate.
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) console.warn('Could not restore Veylo session:', authError.message);
        setCurrentMemberId(user?.id || '');

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
            isVerified: profile.is_verified === true,
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

        if (user) {
          const { data: followRows, error: followError } = await supabase
            .from('follows')
            .select('follower_id, followed_id');

          if (followError) {
            console.error('Could not load Veylo follows:', followError);
          } else {
            setFollows((followRows || []).map((row) => ({
              followerId: row.follower_id,
              followedId: row.followed_id,
            })));
          }
        }

        // Keep these local for now
        const storedPosts = localStorage.getItem(STORAGE.posts);

        const localPosts: NetworkPost[] = storedPosts ? JSON.parse(storedPosts) : [];
        const { data: remotePosts } = await supabase.from('network_posts').select('*').order('created_at', { ascending: false });
        const [{data:remoteLikes},{data:remoteSaves},{data:remoteComments}]=await Promise.all([supabase.from('network_post_likes').select('post_id,user_id'),supabase.from('network_post_saves').select('post_id,user_id'),supabase.from('network_post_comments').select('id,post_id,user_id,content')]);
        setPostSaves((remoteSaves||[]).filter(x=>x.user_id===user?.id).map(x=>x.post_id));
        setPostComments(remoteComments||[]);
        setPosts([...(remotePosts || []).map((p): NetworkPost => ({
          id: p.id, memberId: p.member_id, content: p.content, likes: (remoteLikes||[]).filter(x=>x.post_id===p.id).map(x=>x.user_id), createdAt: p.created_at,
          attachmentPath: p.attachment_path || undefined, attachmentName: p.attachment_name || undefined,
          attachmentType: p.attachment_type || undefined,
        })), ...localPosts.filter(p => !(remotePosts || []).some(r => r.id === p.id))]);

        if (user) {
          await refreshInbox(user.id, (profiles || []).map((profile) => ({
            id: profile.id,
            full_name: profile.full_name,
          })));
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
    knownConversationIdsRef.current = new Set(conversations.map((chat) => chat.id));
  }, [conversations]);

  useEffect(() => {
    if (!ready || !currentMemberId) return;
    const memberId = currentMemberId;

    // Database changes are filtered by existing Supabase RLS policies:
    // Only members of a conversation can receive its messages.
    const channel = supabase.channel('veylo:inbox:' + memberId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const row = payload.new as {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at: string;
          attachment_path?: string;
          attachment_name?: string;
          attachment_type?: string;
          attachment_size?: number;
        };
        if (!row.id || !row.conversation_id) return;

        if (!knownConversationIdsRef.current.has(row.conversation_id)) {
          void refreshInbox(memberId);
          return;
        }

        setConversations((current) => current.map((chat) => {
          if (chat.id !== row.conversation_id) return chat;

          const received: ChatMessage = {
            id: row.id,
            senderId: row.sender_id,
            content: row.content,
            attachmentPath: row.attachment_path || undefined,
            attachmentName: row.attachment_name || undefined,
            attachmentType: row.attachment_type || undefined,
            attachmentSize: row.attachment_size || undefined,
            createdAt: row.created_at,
          };

          const exists = chat.messages.some((message) => message.id === row.id);
          const messages = exists
            ? chat.messages.map((message) =>
                message.id === row.id ? received : message
              )
            : [...chat.messages, received];

          return {
            ...chat,
            messages: messages.sort(
              (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
            ),
          };
        }));
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_members',
        filter: 'user_id=eq.' + memberId,
      }, () => {
        void refreshInbox(memberId);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversation_reads',
        filter: 'user_id=eq.' + memberId,
      }, (payload) => {
        const row = payload.new as {
          conversation_id?: string;
          last_read_at?: string;
        };
        if (!row.conversation_id || !row.last_read_at) return;
        setReadReceipts((current) => {
          const previous = Date.parse(current[row.conversation_id!] || '') || 0;
          if (Date.parse(row.last_read_at!) < previous) return current;
          return { ...current, [row.conversation_id!]: row.last_read_at! };
        });
      })
      .subscribe((status) => {
        // Catch up with events missed while offline or changing network.
        if (status === 'SUBSCRIBED') void refreshInbox(memberId);
      });

    const refreshOnReturn = () => {
      if (document.visibilityState !== 'visible') return;
      void refreshInbox(memberId);
    };
    window.addEventListener('focus', refreshOnReturn);
    document.addEventListener('visibilitychange', refreshOnReturn);

    return () => {
      window.removeEventListener('focus', refreshOnReturn);
      document.removeEventListener('visibilitychange', refreshOnReturn);
      void supabase.removeChannel(channel);
    };
  }, [ready, currentMemberId]);

  useEffect(() => {
    if (!ready || !currentMemberId || !selectedConversationId || page !== 'messages') return;
    if (document.visibilityState !== 'visible') return;

    // The reading progress is saved in Supabase, so other devices agree.
    void markConversationRead(selectedConversationId);
  }, [ready, currentMemberId, selectedConversationId, conversations, page]);

  useEffect(() => {
    const markVisibleConversation = () => {
      if (document.visibilityState === 'visible' && page === 'messages' && selectedConversationId) {
        void markConversationRead(selectedConversationId);
      }
    };
    window.addEventListener('focus', markVisibleConversation);
    document.addEventListener('visibilitychange', markVisibleConversation);
    return () => {
      window.removeEventListener('focus', markVisibleConversation);
      document.removeEventListener('visibilitychange', markVisibleConversation);
    };
  }, [page, selectedConversationId]);

  useEffect(() => {
    if (!ready || !currentMemberId || !selectedConversationId || page !== 'messages') {
      return;
    }

    const conversationId = selectedConversationId;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      await supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;

      channel = supabase.channel('veylo:typing:' + conversationId, {
        config: { private: true, broadcast: { self: false } },
      });

      channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
        const memberId = payload?.memberId;
        if (typeof memberId !== 'string' || memberId === currentMemberId) return;

        if (typingTimeoutsRef.current[memberId]) {
          clearTimeout(typingTimeoutsRef.current[memberId]);
          delete typingTimeoutsRef.current[memberId];
        }

        if (payload?.isTyping === true) {
          setTypingUsers((current) => ({ ...current, [memberId]: true }));
          typingTimeoutsRef.current[memberId] = setTimeout(() => {
            setTypingUsers((current) => {
              const next = { ...current };
              delete next[memberId];
              return next;
            });
            delete typingTimeoutsRef.current[memberId];
          }, 3200);
        } else {
          setTypingUsers((current) => {
            const next = { ...current };
            delete next[memberId];
            return next;
          });
        }
      }).subscribe();
      typingChannelRef.current = channel;
    };

    void subscribe();

    return () => {
      cancelled = true;
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
      typingStopRef.current = null;
      isTypingRef.current = false;
      lastTypingSentRef.current = 0;
      if (channel) void supabase.removeChannel(channel);
      if (typingChannelRef.current === channel) typingChannelRef.current = null;
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
      setTypingUsers({});
    };
  }, [ready, currentMemberId, selectedConversationId, page]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) void audioContextRef.current.close();
    };
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

  const followingMemberIds = useMemo(
    () => new Set(
      follows
        .filter((relationship) => relationship.followerId === currentMemberId)
        .map((relationship) => relationship.followedId)
    ),
    [follows, currentMemberId]
  );

  const getFollowerCount = (memberId: string) =>
    follows.filter((relationship) => relationship.followedId === memberId).length;

  const getFollowingCount = (memberId: string) =>
    follows.filter((relationship) => relationship.followerId === memberId).length;

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ) || null,
    [conversations, selectedConversationId]
  );
  
  const unreadCount = useMemo(() =>
    conversations.reduce((total, chat) => {
      const readTime = Date.parse(readReceipts[chat.id] || '') || 0;
      return total + chat.messages.filter((message) =>
        message.senderId !== currentMemberId &&
        Date.parse(message.createdAt) > readTime
      ).length;
    }, 0),
    [conversations, readReceipts, currentMemberId]
  );

  const activeTypingNames = useMemo(() => {
    if (!selectedConversation) return [];
    return Object.keys(typingUsers)
      .filter((id) => typingUsers[id] && selectedConversation.members.includes(id))
      .map((id) => members.find((member) => member.id === id)?.fullName || 'Someone');
  }, [typingUsers, selectedConversation, members]);

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

    if (!fullName || !email || password.length < 8) {
      alert('Please enter your name, email and a password of at least 8 characters.');
      return;
    }

    setAuthBusy(true);
    try {
      // The account is created in Supabase Auth; the existing database trigger
      // creates the matching Veylo profile and permanent member code.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) throw error;

      setSignupName('');
      setPassword('');
      if (data.session) {
        // If email confirmation is disabled, Supabase signs in immediately.
        window.location.reload();
        return;
      }

      setAuthMode('login');
      alert('Account created. Check your email once to confirm your registration, then log in with your email and password.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      alert('Could not create your account: ' + message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function loginAccount() {
    const email = signupEmail.trim().toLowerCase();
    if (!email || !password) {
      alert('Please enter your email address and password.');
      return;
    }

    setAuthBusy(true);
    try {
      // Password sign-in never sends a magic link or any email.
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('Unable to verify your account.');

      setPassword('');
      // Supabase persists the secure session; refresh to load member data.
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      alert('Could not log in: ' + message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function requestPasswordReset() {
    const email = signupEmail.trim().toLowerCase();
    if (!email) {
      alert('Enter your account email first.');
      return;
    }

    setResetBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/?recovery=1',
      });
      if (error) throw error;
      alert('If the email is registered, a password reset link will be sent. Open it to choose a new password.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try later.';
      alert('Could not send the reset email: ' + message);
    } finally {
      setResetBusy(false);
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentMemberId('');
      setSelectedConversationId('');
      setSelectedOfficeId('');
      setConversations([]);
      setOffices([]);
      setPage('network');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      alert('Could not sign out: ' + message);
    }
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
  }, [currentMember]);

  async function saveProfile() {
    if (!currentMember || profileSaving) return;

    setProfileSaving(true);
    setProfileSaveMessage('');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user || user.id !== currentMember.id) {
        throw new Error('Your login session has expired. Please sign in again.');
      }

      const updatedProfile = {
        full_name: profileDraft.fullName.trim(),
        headline: profileDraft.headline.trim(),
        bio: profileDraft.bio.trim(),
        location: profileDraft.location.trim(),
      };

      // A standard update can report no error even if RLS updates no rows.
      // Return the saved row from Supabase so persistence can be confirmed.
      const { data: savedProfile, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id)
        .select('id, full_name, headline, bio, location')
        .single();

      if (error || !savedProfile) {
        throw error || new Error('Your profile could not be saved.');
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === user.id
            ? {
                ...member,
                fullName: savedProfile.full_name || '',
                headline: savedProfile.headline || '',
                bio: savedProfile.bio || '',
                location: savedProfile.location || '',
              }
            : member
        )
      );

      setProfileSaveMessage('Profile saved to your account. Your bio will remain after refreshing.');
    } catch (error) {
      console.error('Could not save Veylo profile:', error);
      const reason = error instanceof Error ? error.message : 'Please try again.';
      setProfileSaveMessage('Could not save profile: ' + reason);
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePasswordFromProfile() {
    if (newAccountPassword.length < 8) {
      alert('Your new password must be at least 8 characters long.');
      return;
    }
    if (newAccountPassword !== confirmAccountPassword) {
      alert('The two new passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      // Never trust the local member selector for authentication.
      // Only change a password when the Supabase session belongs to this profile.
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !user || (!isRecoveryMode && user.id !== currentMember?.id)) {
        alert('Your secure session is missing. Please open a valid reset link and try again.');
        return;
      }

      // Supabase Auth handles password hashing and secure persistence.
      const { error } = await supabase.auth.updateUser({
        password: newAccountPassword,
      });
      if (error) {
        alert('Could not change password: ' + error.message);
        return;
      }

      setNewAccountPassword('');
      setConfirmAccountPassword('');
      setShowPasswordEditor(false);
      alert('Your Veylo password has been changed successfully.');

      if (isRecoveryMode) {
        setIsRecoveryMode(false);
        window.history.replaceState({}, '', window.location.pathname);
        window.location.reload();
      }
    } catch (error) {
      console.error('Could not change account password', error);
      alert('Something went wrong while saving your password. Please try again.');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function uploadProfilePicture(file?: File) {
    if (!file || !currentMember || avatarUploading) return;

    const formats: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    if (!formats[file.type] || file.size === 0 || file.size > 5 * 1024 * 1024) {
      setAvatarSaveMessage('Use a JPG, PNG or WebP photo of up to 5 MB.');
      return;
    }

    const currentAvatar = currentMember.avatar;
    let uploadedPath: string | null = null;
    setAvatarUploading(true);
    setAvatarSaveMessage('');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user || user.id !== currentMember.id) {
        throw new Error('Sign in to your account before updating your picture.');
      }

      // Each picture has a unique path inside the signed-in user's own folder.
      const filePath = `${user.id}/${crypto.randomUUID()}.${formats[file.type]}`;
      const { error: uploadError } = await supabase.storage
        .from('veylo-avatars')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });
      if (uploadError) throw uploadError;
      uploadedPath = filePath;

      const { data: publicData } = supabase.storage
        .from('veylo-avatars')
        .getPublicUrl(filePath);

      const { data: savedProfile, error: saveError } = await supabase
        .from('profiles')
        .update({ avatar: publicData.publicUrl })
        .eq('id', user.id)
        .select('avatar')
        .single();

      if (saveError || !savedProfile) {
        throw saveError || new Error('Supabase did not save your profile picture.');
      }

      setMembers((current) => current.map((member) =>
        member.id === user.id
          ? { ...member, avatar: savedProfile.avatar }
          : member
      ));
      setAvatarSaveMessage('Photo saved to your Veylo profile and available on your other devices.');

      // Remove the replaced photo from this member's storage folder only.
      if (currentAvatar && currentAvatar !== savedProfile.avatar) {
        try {
          const oldUrl = new URL(currentAvatar);
          const prefix = '/storage/v1/object/public/veylo-avatars/' + user.id + '/';
          if (oldUrl.pathname.startsWith(prefix)) {
            const oldPath = decodeURIComponent(oldUrl.pathname.split('/storage/v1/object/public/veylo-avatars/')[1]);
            const { error: cleanupError } = await supabase.storage
              .from('veylo-avatars')
              .remove([oldPath]);
            if (cleanupError) console.warn('Old avatar cleanup failed:', cleanupError);
          }
        } catch {
          // Older local-only pictures do not have a storage URL to remove.
        }
      }
    } catch (error) {
      console.error('Could not save Veylo profile picture:', error);
      setAvatarSaveMessage(
        'Picture not saved: ' +
        (error instanceof Error ? error.message : 'Please try again.')
      );
      if (uploadedPath) {
        await supabase.storage.from('veylo-avatars').remove([uploadedPath]);
      }
    } finally {
      setAvatarUploading(false);
    }
  }

  async function toggleFollow(member: Member) {
    if (!currentMember || member.id === currentMember.id || followBusyId) return;

    setFollowBusyId(member.id);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user || user.id !== currentMember.id) {
        throw new Error('Please sign in again to follow other members.');
      }

      const alreadyFollowing = follows.some(
        (relationship) =>
          relationship.followerId === user.id && relationship.followedId === member.id
      );

      if (alreadyFollowing) {
        const { data, error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', member.id)
          .select('follower_id');

        if (error || !data || data.length !== 1) {
          throw error || new Error('Could not unfollow this member.');
        }

        setFollows((current) => current.filter(
          (relationship) =>
            !(relationship.followerId === user.id && relationship.followedId === member.id)
        ));
      } else {
        const { data, error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, followed_id: member.id })
          .select('follower_id, followed_id')
          .single();

        if (error || !data) {
          throw error || new Error('Could not follow this member.');
        }

        setFollows((current) => {
          if (current.some(
            (relationship) =>
              relationship.followerId === data.follower_id &&
              relationship.followedId === data.followed_id
          )) return current;
          return [...current, {
            followerId: data.follower_id,
            followedId: data.followed_id,
          }];
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      alert('Follow could not be updated: ' + message);
    } finally {
      setFollowBusyId('');
    }
  }

  function normaliseProjectWebsite(value: string): string | null {
    const input = value.trim();
    if (!input) return '';
    if (input.length > 500) return null;
    try {
      // Make business website links useful even when entered without https://.
      const candidate = /^https?:\/\//i.test(input) ? input : 'https://' + input;
      const url = new URL(candidate);
      return (url.protocol === 'https:' || url.protocol === 'http:') &&
        url.hostname.includes('.') ? url.href : null;
    } catch {
      return null;
    }
  }

  async function persistProjects(projects: Project[]): Promise<Project[]> {
    if (!currentMember) throw new Error('Please sign in first.');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== currentMember.id) {
      throw new Error('Your login session has expired.');
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ projects })
      .eq('id', user.id)
      .select('projects')
      .single();

    if (error || !data) throw error || new Error('Project changes were not saved.');
    const saved: Project[] = Array.isArray(data.projects) ? data.projects : projects;

    setMembers((current) => current.map((member) =>
      member.id === user.id ? { ...member, projects: saved } : member
    ));
    return saved;
  }

  async function addProject() {
    if (!currentMember || !projectDraft.title.trim()) return;

    const website = normaliseProjectWebsite(projectDraft.website);
    if (website === null) {
      setProjectLinkNotice('Enter a valid business website link, such as example.com.');
      return;
    }

    const project: Project = {
      id: crypto.randomUUID(),
      title: projectDraft.title.trim(),
      role: projectDraft.role.trim(),
      year: projectDraft.year.trim(),
      description: projectDraft.description.trim(),
      website,
    };

    try {
      await persistProjects([...currentMember.projects, project]);
      setProjectDraft({ title: '', role: '', year: '', description: '', website: '' });
      setProjectLinkNotice('Project saved to your Veylo profile.');
    } catch (error) {
      console.error('Could not add Veylo project:', error);
      setProjectLinkNotice('Project not saved: ' + (error instanceof Error ? error.message : 'Try again.'));
    }
  }

  async function saveProjectWebsite(projectId: string) {
    if (!currentMember || projectLinkSavingId) return;
    const project = currentMember.projects.find((item) => item.id === projectId);
    if (!project) return;

    const website = normaliseProjectWebsite(projectLinkEdits[project.id] ?? project.website ?? '');
    if (website === null) {
      setProjectLinkNotice('Enter a valid business website, such as example.com.');
      return;
    }

    setProjectLinkSavingId(projectId);
    try {
      await persistProjects(currentMember.projects.map((item) =>
        item.id === projectId ? { ...item, website } : item
      ));
      setProjectLinkNotice('Website saved for ' + project.title + '.');
    } catch (error) {
      setProjectLinkNotice('Website not saved: ' + (error instanceof Error ? error.message : 'Try again.'));
    } finally {
      setProjectLinkSavingId('');
    }
  }

  async function removeProject(projectId: string) {
    if (!currentMember) return;
    try {
      await persistProjects(currentMember.projects.filter((project) => project.id !== projectId));
      setProjectLinkNotice('Project removed from your profile.');
    } catch (error) {
      alert('Project was not removed: ' + (error instanceof Error ? error.message : 'Please try again.'));
    }
  }

  function openMemberProfile(member: Member) {
    setViewedMemberId(member.id);

    setPage('memberProfile');
  }

  /* =====================================================
     NETWORK
  ===================================================== */

  async function createPost() {
    if (!currentMember || posting || (!postText.trim() && !postFile)) return;
    setPosting(true);
    let path = '';
    try {
      if (postFile && postFile.size > 50 * 1024 * 1024) throw new Error('Max 50 MB per file.');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== currentMember.id) throw new Error('Please log in again.');
      const id = crypto.randomUUID();
      if (postFile) {
        path = user.id + '/' + id + '/' + postFile.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
        const { error } = await supabase.storage.from('network-attachments').upload(path, postFile, { upsert: false });
        if (error) throw error;
      }
      const { data, error } = await supabase.from('network_posts').insert({
        id, member_id: user.id, content: postText.trim(), attachment_path: path || null,
        attachment_name: postFile?.name || null, attachment_type: postFile?.type || null,
      }).select('created_at').single();
      if (error || !data) throw error || new Error('Post failed.');
      setPosts(old => [{
        id, memberId: user.id, content: postText.trim(), createdAt: data.created_at,
        attachmentPath: path || undefined, attachmentName: postFile?.name,
        attachmentType: postFile?.type, likes: [],
      }, ...old]);
      setPostText('');
      setPostFile(null);
      if (postFileInput.current) postFileInput.current.value = '';
    } catch (error) {
      alert('Could not post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally { setPosting(false); }
  }

  async function toggleLike(postId: string) {
    if (!currentMember) return;
    const liked=posts.find(p=>p.id===postId)?.likes.includes(currentMember.id);
    const result=liked?await supabase.from('network_post_likes').delete().eq('post_id',postId).eq('user_id',currentMember.id):await supabase.from('network_post_likes').insert({post_id:postId,user_id:currentMember.id});
    if(result.error){alert('Could not save like: '+result.error.message);return;}
    setPosts(old=>old.map(p=>p.id!==postId?p:{...p,likes:liked?p.likes.filter(id=>id!==currentMember.id):[...p.likes,currentMember.id]}));
  }
  async function togglePostSave(postId:string){
    if(!currentMember)return;
    const saved=postSaves.includes(postId);
    const result=saved?await supabase.from('network_post_saves').delete().eq('post_id',postId).eq('user_id',currentMember.id):await supabase.from('network_post_saves').insert({post_id:postId,user_id:currentMember.id});
    if(result.error){alert('Could not save post: '+result.error.message);return;}
    setPostSaves(old=>saved?old.filter(id=>id!==postId):[...old,postId]);
  }
  async function commentOnPost(postId:string){
    if(!currentMember)return;
    const content=window.prompt('Write a comment');
    if(!content?.trim())return;
    const {data,error}=await supabase.from('network_post_comments').insert({post_id:postId,user_id:currentMember.id,content:content.trim()}).select('id,post_id,user_id,content').single();
    if(error){alert('Could not post comment: '+error.message);return;}
    setPostComments(old=>[...old,data]);
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
    if (!currentMember || !selectedConversation) return;
    const content = messageText.trim();
    if (!content) return;

    const conversationId = selectedConversation.id;
    const messageId = crypto.randomUUID();
    const optimistic: ChatMessage = {
      id: messageId,
      senderId: currentMember.id,
      content,
      createdAt: new Date().toISOString(),
      sending: true,
    };

    // Render immediately; the sender can keep typing while Supabase persists.
    setConversations((current) => current.map((chat) =>
      chat.id === conversationId
        ? { ...chat, messages: [...chat.messages, optimistic] }
        : chat
    ));
    setMessageText('');
    if (typingStopRef.current) clearTimeout(typingStopRef.current);
    typingStopRef.current = null;
    broadcastTyping(false);
    playSentMessagePop();

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          conversation_id: conversationId,
          sender_id: currentMember.id,
          content,
        })
        .select('id, created_at')
        .single();
      if (error || !data) throw error || new Error('The message was not saved.');

      // Realtime might have delivered the same ID already: never duplicate it.
      setConversations((current) => current.map((chat) =>
        chat.id !== conversationId
          ? chat
          : {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === messageId
                  ? { ...message, createdAt: data.created_at, sending: false }
                  : message
              ).sort((one, two) => Date.parse(one.createdAt) - Date.parse(two.createdAt)),
            }
      ));
    } catch (error) {
      console.error('Could not send Veylo message:', error);
      setConversations((current) => current.map((chat) =>
        chat.id !== conversationId ? chat : {
          ...chat,
          messages: chat.messages.filter((message) => message.id !== messageId),
        }
      ));
      setMessageText((draft) => draft.trim() ? draft : content);
      alert('Message was not sent. Your text is still in the message box. Please try again.');
    }
  }

  async function sendAttachment(file: File) {
    if (!currentMember || !selectedConversation || attachmentBusy) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Files must be 15 MB or smaller.');
      return;
    }
    setAttachmentBusy(true);
    const conversationId = selectedConversation.id;
    const memberId = currentMember.id;
    const messageId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-130) || 'attachment';
    const path = conversationId + '/' + memberId + '/' + messageId + '/' + safeName;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== memberId) throw new Error('Please sign in again.');
      const { error: uploadError } = await supabase.storage.from('message-attachments')
        .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      if (uploadError) throw uploadError;
      const { error: messageError } = await supabase.from('messages').insert({
        id: messageId,
        conversation_id: conversationId,
        sender_id: memberId,
        content: '',
        attachment_path: path,
        attachment_name: file.name,
        attachment_type: file.type || 'application/octet-stream',
        attachment_size: file.size,
      });
      if (messageError) {
        await supabase.storage.from('message-attachments').remove([path]);
        throw messageError;
      }
      playSentMessagePop();
      await refreshInbox(memberId);
    } catch (error) {
      console.error('Could not send attachment:', error);
      alert('File was not sent: ' + (error instanceof Error ? error.message : 'Please try again.'));
    } finally {
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      setAttachmentBusy(false);
    }
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
    if (newsLoading) return;
    setNewsLoading(true);
    setNewsMessage('');

    try {
      const response = await fetch('/api/vbn', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.connected) {
        throw new Error(data.message || 'Unable to load live business headlines.');
      }

      setNews(Array.isArray(data.articles) ? data.articles : []);
      setNewsUpdatedAt(typeof data.updatedAt === 'string' ? data.updatedAt : '');
      setNewsMessage(typeof data.message === 'string' ? data.message : '');
    } catch (error) {
      console.error('VBN could not refresh:', error);
      setNewsMessage(
        'Unable to refresh the live headlines right now. Please try again shortly.'
      );
    } finally {
      setNewsLoading(false);
    }
  }

  useEffect(() => {
    if (page === 'vbn' && news.length === 0 && !newsMessage) {
      loadNews();
    }
  }, [page]);

  useEffect(() => {
    if (page !== 'messages' || !selectedConversationId || !messagesEndRef.current) return;
    const panel = messagesEndRef.current;
    panel.scrollTop = panel.scrollHeight;
  }, [page, selectedConversationId, selectedConversation?.messages.length]);

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

  if (isRecoveryMode) {
    return (
      <main className="authPage">
        <section className="authCard">
          <img
            src="/Veylo_Networks_White_Transparent.png"
            alt="Veylo Networks"
            className="authLogo"
          />
          <span className="pill">ACCOUNT SECURITY</span>
          <h1>Reset your password</h1>
          <p className="muted">
            Choose a new password to finish recovering your Veylo account.
          </p>
          <div className="stack">
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              placeholder="New password (at least 8 characters)"
              value={newAccountPassword}
              onChange={(event) => setNewAccountPassword(event.target.value)}
            />
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your new password"
              value={confirmAccountPassword}
              onChange={(event) => setConfirmAccountPassword(event.target.value)}
            />
            <button
              className="primary full"
              type="button"
              disabled={passwordSaving}
              onClick={changePasswordFromProfile}
            >
              {passwordSaving ? 'Saving password...' : 'Save New Password'}
            </button>
            <button
              className="secondary full"
              type="button"
              onClick={() => {
                setIsRecoveryMode(false);
                setNewAccountPassword('');
                setConfirmAccountPassword('');
                window.history.replaceState({}, '', window.location.pathname);
              }}
            >
              Back to Veylo
            </button>
          </div>
        </section>
      </main>
    );
  }

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
          <h1>{authMode === 'signup' ? 'Join Veylo Networks' : 'Welcome back'}</h1>
          <p className="muted">
            {authMode === 'signup'
              ? 'Create your professional Veylo account.'
              : 'Log in with your email and password. No email link required.'}
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
              disabled={authBusy}
            >
              Sign Up
            </button>
            <button
              type="button"
              className={authMode === 'login' ? 'primary' : 'field'}
              onClick={() => setAuthMode('login')}
              disabled={authBusy}
            >
              Log In
            </button>
          </div>

          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              if (authMode === 'signup') {
                createAccount();
              } else {
                loginAccount();
              }
            }}
          >
            {authMode === 'signup' && (
              <input
                className="field"
                type="text"
                autoComplete="name"
                placeholder="Full name"
                value={signupName}
                onChange={(event) => setSignupName(event.target.value)}
                required
              />
            )}
            <input
              className="field"
              type="email"
              autoComplete="email"
              placeholder="Email address"
              value={signupEmail}
              onChange={(event) => setSignupEmail(event.target.value)}
              required
            />
            <input
              className="field"
              type="password"
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              placeholder={authMode === 'signup' ? 'Create password (8+ characters)' : 'Password'}
              minLength={authMode === 'signup' ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              className="primary full"
              type="submit"
              disabled={authBusy}
            >
              {authBusy
                ? 'Please wait...'
                : authMode === 'signup'
                  ? 'Create Veylo Account'
                  : 'Log In'}
            </button>
          </form>

          {authMode === 'login' && (
            <button
              type="button"
              className="vbnForgotPassword"
              disabled={resetBusy || authBusy}
              onClick={requestPasswordReset}
            >
              {resetBusy ? 'Sending reset link...' : 'Forgot password?'}
            </button>
          )}

          <p className="muted small" style={{ marginTop: '12px' }}>
            {authMode === 'signup'
              ? 'Email verification is required once when registering.'
              : 'Your password is kept securely in Supabase Authentication.'}
          </p>
        </section>
      </main>
    );
  }

  /* =====================================================
     APP
  ===================================================== */

  return (
    <main className={'app veyloNavPosition-' + mobileNavPosition + (mobileNavCollapsed ? ' veyloNavCollapsed' : '')}>
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
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="veyloUnreadBadge desktopUnreadBadge" aria-label={unreadCount + ' unread messages'}>
                  {unreadCount >= 99 ? '99+' : unreadCount}
                </span>
              )}
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
          <div className="desktopTopbarInfo">
            <span className="eyebrow">VEYLO NETWORKS</span>
            <h1>{pageTitle(page)}</h1>
          </div>

          <div className="mobileTopbarBrand">
            <img src="/Veylo_Networks_White_Transparent.png" alt="Veylo Networks" />
            <div>
              <span>VEYLO NETWORKS</span>
              <strong>{pageTitle(page)}</strong>
            </div>
          </div>
          <button
            className="mobileMoreButton"
            type="button"
            aria-label="More Veylo options"
            aria-controls="veylo-mobile-menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">•••</span>
          </button>

          <button className="avatarButton desktopAvatarButton" onClick={() => setPage('profile')} aria-label="My Profile">
            <Avatar member={currentMember} />
          </button>
        </header>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              className="mobileMenuBackdrop"
              aria-label="Close more options"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="mobileMoreMenu" id="veylo-mobile-menu">
              <div className="mobileMenuMember">
                <Avatar member={currentMember} />
                <div>
                  <strong>{currentMember.fullName}</strong>
                  <small>{currentMember.memberCode}</small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPage('coming');
                }}
              >
                Coming Soon
              </button>
              <button
                type="button"
                className="mobileMenuSignOut"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
              >
                Sign Out
              </button>
            </div>
          </>
        )}

        <div className="content">
          {/* NETWORK */}

          {page === 'network' && (
            <section className="networkColumn veyloCleanFeed">
              <div className="veyloNetworkShortcuts">
                <div className="veyloNetworkTitle"><span className="veyloNetworkKicker">THE BUSINESS COMMUNITY</span><strong>Network<span className="veyloBluePeriod">.</span></strong></div>
                <button type="button" onClick={() => setPage('vbn')}>VBN <span aria-hidden="true">↗</span></button>
              </div>
              <div className="glass composer veyloReferenceComposer">
                <div className="veyloComposerEntry"><Avatar member={currentMember} /><textarea value={postText} onChange={event=>setPostText(event.target.value)} placeholder="Share an idea or update..." /></div>
                <input ref={postFileInput} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" style={{display:'none'}} onChange={e=>setPostFile(e.target.files?.[0]||null)} />
                {postFile && <div className="small">📎 {postFile.name} <button className="secondary" onClick={()=>{setPostFile(null);if(postFileInput.current)postFileInput.current.value='';}}>Remove</button></div>}
                <div className="composerFooter veyloComposerFooter">
                  <div className="veyloComposerToolGroup">
                    <button type="button" className={'veyloClipToggle'+(networkToolsOpen?' isOpen':'')} aria-label={networkToolsOpen?'Close attachment options':'Open attachment options'} aria-expanded={networkToolsOpen} onClick={()=>setNetworkToolsOpen(open=>!open)}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20.5 11.5-8.9 8.9a6 6 0 0 1-8.5-8.5L13.4 1.6a4 4 0 0 1 5.7 5.7L8.8 17.6a2 2 0 0 1-2.8-2.8l9-9"/></svg></button>
                    <div className={'veyloComposerTools'+(networkToolsOpen?' isOpen':'')} aria-hidden={!networkToolsOpen}>
                      <button type="button" className="veyloComposerTool" title="Add photo" aria-label="Add photo" onClick={()=>{if(postFileInput.current){postFileInput.current.accept='image/*';postFileInput.current.click();}}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22,display:'block',flexShrink:0}}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></button>
                    <button type="button" className="veyloComposerTool" title="Add file" aria-label="Add file" onClick={()=>{if(postFileInput.current){postFileInput.current.accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip';postFileInput.current.click();}}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22,display:'block',flexShrink:0}}><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-6-6H8Z"/><path d="M14 3v6h6M7 13h10M7 17h8"/></svg></button>
                    <button type="button" className="veyloComposerTool" title="Add link" aria-label="Add link" onClick={()=>{const value=window.prompt('Paste your website link');if(!value?.trim())return;try{const url=new URL(value.trim());if(!['https:','http:'].includes(url.protocol))throw new Error('Invalid link');setPostText(text=>text?text.trimEnd()+'\n'+url.href:url.href);}catch{alert('Please enter a valid link starting with https://');}}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22,display:'block',flexShrink:0}}><path d="M10 13a5 5 0 0 0 7.1 0l2.1-2.1a5 5 0 0 0-7.1-7.1L10.9 5"/><path d="M14 11a5 5 0 0 0-7.1 0l-2.1 2.1a5 5 0 0 0 7.1 7.1l1.2-1.2"/></svg></button>
                    <button type="button" className="veyloComposerTool" title="Add video" aria-label="Add video" onClick={()=>{if(postFileInput.current){postFileInput.current.accept='video/*';postFileInput.current.click();}}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22,display:'block',flexShrink:0}}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg></button>
                  </div>

                    </div>
                  </div>
                  <button className="primary" disabled={posting} onClick={()=>void createPost()}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline-block',verticalAlign:'middle',marginRight:6}}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>Post</button>
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

                      {post.content && <p className="postContent"><NetworkPostText content={post.content} /></p>}
                      {post.attachmentPath && <NetworkPostMedia post={post} />}

                      <div className="veyloSocialActionBar veyloEngagementActions">
                        <button type="button" className={liked ? 'likeButton liked' : 'likeButton'} onClick={() => void toggleLike(post.id)} aria-label={liked?'Unlike post':'Like post'}><svg width="25" height="25" style={{display:"block",width:25,height:25,flexShrink:0}} viewBox="0 0 24 24" fill={liked?'currentColor':'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg><span>{post.likes.length}</span><small>Like</small></button>
                        <button type="button" onClick={() => void commentOnPost(post.id)} aria-label="Comment on post"><svg width="25" height="25" style={{display:"block",width:25,height:25,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.4a8.5 8.5 0 1 1 16.1-4.1Z"/></svg><span>{postComments.filter(c=>c.post_id===post.id).length}</span><small>Comment</small></button>
                        <button type="button" onClick={() => { const url=window.location.origin+'/?post='+encodeURIComponent(post.id); if(navigator.share)void navigator.share({title:'Veylo Networks',url}).catch(()=>{});else if(navigator.clipboard)void navigator.clipboard.writeText(url).then(()=>alert('Post link copied'));else window.prompt('Copy link',url); }} aria-label="Share post"><svg width="25" height="25" style={{display:"block",width:25,height:25,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4 21 12l-8 8v-5c-6 0-9 2-11 5 0-8 3-13 11-13V4Z"/></svg><small>Share</small></button>
                        <button type="button" className={postSaves.includes(post.id)?'isSaved':''} onClick={() => void togglePostSave(post.id)} aria-label={postSaves.includes(post.id)?'Unsave post':'Save post'}><svg width="25" height="25" style={{display:"block",width:25,height:25,flexShrink:0}} viewBox="0 0 24 24" fill={postSaves.includes(post.id)?'currentColor':'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-7-5-7 5V3Z"/></svg><small>{postSaves.includes(post.id)?'Saved':'Save'}</small></button>
                      </div>
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

                      <p className="memberFollowCounts compact">
                        <span><strong>{getFollowerCount(member.id)}</strong> followers</span>
                        <span><strong>{getFollowingCount(member.id)}</strong> following</span>
                      </p>

                      <ExpandableText
                        className="personBio muted"
                        text={member.bio}
                        maxCharacters={145}
                        emptyText="No bio added yet."
                      />

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
                        <button
                          type="button"
                          className={followingMemberIds.has(member.id) ? 'secondary followButton isFollowing' : 'secondary followButton'}
                          disabled={followBusyId === member.id}
                          aria-pressed={followingMemberIds.has(member.id)}
                          onClick={() => toggleFollow(member)}
                        >
                          {followBusyId === member.id
                            ? 'Saving...'
                            : followingMemberIds.has(member.id) ? 'Following ✓' : '+ Follow'}
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
                  <h2 className="veyloVerifiedName">{viewedMember.fullName}{viewedMember.isVerified && <span className="veyloVerifiedBadge" title="Veylo Verified" aria-label="Veylo Verified">✓</span>}</h2>

                  <p className="profileHeadline">
                    {viewedMember.headline || 'Veylo Member'}
                  </p>

                  <div className="profileMetadata">
                    {viewedMember.location && (
                      <span>{viewedMember.location}</span>
                    )}

                    <MemberCode code={viewedMember.memberCode} />
                  </div>

                  <div className="veyloProfileAbout">
                    <span className="eyebrow">ABOUT</span>
                    <ExpandableText
                      className="muted profileBio"
                      text={viewedMember.bio}
                      maxCharacters={240}
                      emptyText="No bio added yet."
                    />
                  </div>

                  <div className="memberFollowCounts">
                    <span><strong>{getFollowerCount(viewedMember.id)}</strong> followers</span>
                    <span><strong>{getFollowingCount(viewedMember.id)}</strong> following</span>
                  </div>

                  <div className="memberProfileActionRow">
                    <button
                      className="primary"
                      type="button"
                      onClick={() => startDirectChat(viewedMember)}
                    >
                      Message
                    </button>
                    <button
                      type="button"
                      className={followingMemberIds.has(viewedMember.id) ? 'secondary followButton isFollowing' : 'secondary followButton'}
                      disabled={followBusyId === viewedMember.id}
                      aria-pressed={followingMemberIds.has(viewedMember.id)}
                      onClick={() => toggleFollow(viewedMember)}
                    >
                      {followBusyId === viewedMember.id
                        ? 'Saving...'
                        : followingMemberIds.has(viewedMember.id) ? 'Following ✓' : '+ Follow'}
                    </button>
                  </div>
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

                    <ExpandableText
                      className="muted"
                      text={project.description}
                      maxCharacters={210}
                      emptyText="No project description added."
                    />
                    {project.website && normaliseProjectWebsite(project.website) && (
                      <a
                        className="veyloProjectLink"
                        href={normaliseProjectWebsite(project.website) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit business website ↗
                      </a>
                    )}
                  </article>
                ))
              )}
            </section>
          )}

          {/* MESSAGES */}

          {page === 'messages' && (
            <div className="twoColumnLayout mobileConversationLayout" data-mobile-view={selectedConversation ? 'detail' : 'list'}>
              <aside className="glass panel mobileConversationList">
                <h3>Messages</h3>

                <details className="veyloCreateDisclosure"><summary>＋ New group</summary><div className="stack">
                  <input
                    className="field"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                  />

                  <button className="primary full" onClick={createGroup}>
                    Create Group
                  </button>
                </div></details>

                {visibleConversations.length === 0 && (
                  <div className="mobileListEmpty">
                    <p>No conversations yet. Find a Veylo member and start a chat.</p>
                    <button type="button" className="secondary" onClick={() => setPage('people')}>
                      Find people
                    </button>
                  </div>
                )}
                <div className="list">
                  {visibleConversations.map((conversation) => {
                    const displayName = getConversationName(
                      conversation,
                      currentMember,
                      members
                    );

                    const readTime = Date.parse(readReceipts[conversation.id] || '') || 0;
                    const unread = conversation.messages.filter((message) =>
                      message.senderId !== currentMember.id &&
                      Date.parse(message.createdAt) > readTime
                    ).length;
                    const lastMessage = conversation.messages[conversation.messages.length - 1];

                    return (
                      <button
                        key={conversation.id}
                        className={
                          selectedConversationId === conversation.id
                            ? 'listButton active'
                            : 'listButton'
                        }
                        onClick={() => setSelectedConversationId(conversation.id)}
                      >
                        <strong className="veyloChatListTitle">{displayName}</strong>
                        <span className="veyloChatPreview">
                          {lastMessage
                            ? (lastMessage.senderId === currentMember.id ? 'You: ' : '') + lastMessage.content
                            : conversation.type === 'group'
                              ? `${conversation.members.length} members`
                              : 'Start a conversation'}
                        </span>
                        {unread > 0 && (
                          <span className="veyloUnreadBadge chatUnreadBadge" aria-label={unread + ' unread messages'}>
                            {unread >= 99 ? '99+' : unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="glass chatPanel">
                {selectedConversation && (
                  <button
                    type="button"
                    className="mobileDetailBack"
                    onClick={() => setSelectedConversationId('')}
                  >
                    <span aria-hidden="true">←</span> All conversations
                  </button>
                )}
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

                    <div className="messageArea" ref={messagesEndRef}>
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

                              {message.content && <span>{message.content}</span>}
                              {message.attachmentPath && <MessageAttachment message={message} />}
                              {message.sending && (
                                <span className="veyloSendingState" aria-label="Sending message">
                                  Sending…
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                      {activeTypingNames.length > 0 && (
                        <div className="veyloTypingRow" role="status" aria-live="polite">
                          <span className="veyloTypingKeyboard" aria-hidden="true">⌨</span>
                          <span className="veyloTypingBubble" aria-hidden="true">
                            <i /><i /><i />
                          </span>
                          <span className="veyloTypingLabel">
                            {activeTypingNames.slice(0, 2).join(' and ')}
                            {activeTypingNames.length > 2 ? ' and others' : ''}
                            {' '}typing…
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="messageComposer">
                      <input ref={attachmentInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" style={{ display: "none" }} onChange={(event) => { const file = event.target.files?.[0]; if (file) void sendAttachment(file); }} />
                      <button type="button" className="secondary" title="Attach photo or file" aria-label="Attach photo or file" disabled={attachmentBusy} onClick={() => attachmentInputRef.current?.click()}>{attachmentBusy ? "Uploading…" : "📎"}</button>
                      <input
                        className="field"
                        placeholder="Write a message..."
                        value={messageText}
                        onChange={(event) => {
                          const value = event.target.value;
                          setMessageText(value);
                          if (typingStopRef.current) clearTimeout(typingStopRef.current);
                          if (value.trim()) {
                            broadcastTyping(true);
                            typingStopRef.current = setTimeout(() => {
                              broadcastTyping(false);
                              typingStopRef.current = null;
                            }, 1700);
                          } else {
                            broadcastTyping(false);
                          }
                        }}
                        onBlur={() => {
                          if (typingStopRef.current) clearTimeout(typingStopRef.current);
                          typingStopRef.current = null;
                          broadcastTyping(false);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void sendMessage();
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
            <div className="twoColumnLayout mobileOfficeLayout" data-mobile-view={selectedOffice ? 'detail' : 'list'}>
              <aside className="glass panel mobileOfficeList">
                <h3>Internal Offices</h3>

                <details className="veyloCreateDisclosure"><summary>＋ New office</summary><div className="stack">
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
                </div></details>

                {visibleOffices.length === 0 && (
                  <p className="mobileListEmpty">Create your first office to manage projects and collaborate with colleagues.</p>
                )}
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
                {selectedOffice && (
                  <button
                    type="button"
                    className="mobileDetailBack"
                    onClick={() => setSelectedOfficeId('')}
                  >
                    <span aria-hidden="true">←</span> All offices
                  </button>
                )}
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

                          <div className="veyloMeetingFields">
                            <label className="veyloMeetingField"><span>Date</span><input aria-label="Meeting date" className="field" type="date" value={meetingDraft.date} onChange={(event) => setMeetingDraft((current) => ({ ...current, date: event.target.value }))} /></label>
                            <label className="veyloMeetingField"><span>Time</span><input aria-label="Meeting time" className="field" type="time" value={meetingDraft.time} onChange={(event) => setMeetingDraft((current) => ({ ...current, time: event.target.value }))} /></label>
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

          {/* VBN - business news newsroom */}
          {page === 'vbn' && (
            <VbnNewsroom
              articles={news}
              loading={newsLoading}
              message={newsMessage}
              updatedAt={newsUpdatedAt}
              onRefresh={loadNews}
            />
          )}

          {/* PERSONAL PROFILE */}

          {page === 'profile' && (
            <div className="profileGrid">
              <section className="glass profileEditor">
                <div className="profileHero">
                  <Avatar member={currentMember} large />

                  <div>
                    <span className="eyebrow">PERSONAL PROFILE</span>

                    <h2 className="veyloVerifiedName">{currentMember.fullName}{currentMember.isVerified && <span className="veyloVerifiedBadge" title="Veylo Verified" aria-label="Veylo Verified">✓</span>}</h2>

                    <MemberCode code={currentMember.memberCode} larger />

                    <p className="muted small veyloProfileTagline">{currentMember.headline || 'Building meaningful business connections'}{currentMember.location ? ' · ' + currentMember.location : ''}</p>
                    <div className="veyloProfileQuickStats"><div><strong>{posts.filter(post => post.memberId === currentMember.id).length}</strong><span>Posts</span></div><div><strong>{currentMember.projects.length}</strong><span>Projects</span></div><div><strong>{getFollowerCount(currentMember.id)}</strong><span>Followers</span></div><div><strong>{getFollowingCount(currentMember.id)}</strong><span>Following</span></div></div>
                    <div className="memberFollowCounts">
                      <span><strong>{getFollowerCount(currentMember.id)}</strong> followers</span>
                      <span><strong>{getFollowingCount(currentMember.id)}</strong> following</span>
                    </div>
                  </div>
                </div>

                <div className="veyloProfileHeroActions"><button type="button" onClick={() => document.getElementById('veylo-edit-profile-fields')?.scrollIntoView({behavior:'smooth',block:'start'})}>Edit profile</button><button type="button" onClick={() => setPage('network')}>View Network ↗</button></div>
                <div className="veyloProfileSettingsControl">
                  <button type="button" className={'veyloSettingsButton' + (profileSettingsOpen ? ' open' : '')}
                    aria-expanded={profileSettingsOpen} aria-controls="veylo-profile-settings"
                    onClick={() => setProfileSettingsOpen(open => !open)}>
                    <span className="veyloSettingsGear" aria-hidden="true">⚙</span> Settings
                    <span aria-hidden="true">{profileSettingsOpen ? '⌃' : '⌄'}</span>
                  </button>
                  <div id="veylo-profile-settings" className={'veyloSettingsReveal' + (profileSettingsOpen ? ' expanded' : '')}>
                    <div className="veyloSettingsRevealInner">
                <div className="veyloNavSettings">
                  <div className="veyloNavSettingsHeading"><span aria-hidden="true">⚙</span> Navigation Settings</div>
                  <p className="muted small">Choose where the navigation bar appears on your phone.</p>
                  <div className="veyloNavSettingChoices" role="group" aria-label="Mobile navigation position">
                    {(['right','left','bottom'] as const).map(position => (
                      <button type="button" key={position} aria-pressed={mobileNavPosition === position}
                        className={'veyloNavChoice' + (mobileNavPosition === position ? ' selected' : '')}
                        onClick={() => changeMobileNavPosition(position)}>
                        {position === 'right' ? 'Right side' : position === 'left' ? 'Left side' : 'Bottom'}
                      </button>
                    ))}
                  </div>
                </div>
                    </div>
                  </div>
                </div>
                <label className={avatarUploading ? 'uploadButton isUploading' : 'uploadButton'}>
                  {avatarUploading ? 'Uploading and saving photo...' : 'Change Profile Picture'}
                  <input
                    hidden
                    disabled={avatarUploading}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      uploadProfilePicture(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </label>
                <p className="muted small avatarHelperText">
                  JPG, PNG or WebP, up to 5 MB. Your picture is visible to Veylo members.
                </p>
                {avatarSaveMessage && (
                  <p className="profileSaveNotice" role="status" aria-live="polite">
                    {avatarSaveMessage}
                  </p>
                )}

                <div className="stack" id="veylo-edit-profile-fields">
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

                  <button className="primary" type="button" onClick={saveProfile} disabled={profileSaving}>
                    {profileSaving ? 'Saving your profile...' : 'Save Profile'}
                  </button>
                  {profileSaveMessage && (
                    <p className="profileSaveNotice" role="status" aria-live="polite">
                      {profileSaveMessage}
                    </p>
                  )}

                  <section
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      marginTop: '22px',
                      paddingTop: '20px',
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px' }}>Account Security</h3>
                    <p className="muted small">
                      Change your Veylo login password. Your profile and projects will be kept.
                    </p>
                    {showPasswordEditor ? (
                      <div className="stack" style={{ marginTop: '14px' }}>
                        <FieldLabel label="New password">
                          <input
                            className="field"
                            type="password"
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={newAccountPassword}
                            onChange={(event) => setNewAccountPassword(event.target.value)}
                          />
                        </FieldLabel>
                        <FieldLabel label="Confirm new password">
                          <input
                            className="field"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Type the new password again"
                            value={confirmAccountPassword}
                            onChange={(event) => setConfirmAccountPassword(event.target.value)}
                          />
                        </FieldLabel>
                        <button
                          className="primary"
                          type="button"
                          disabled={passwordSaving}
                          onClick={changePasswordFromProfile}
                        >
                          {passwordSaving ? 'Saving password...' : 'Save New Password'}
                        </button>
                        <button
                          type="button"
                          className="field"
                          disabled={passwordSaving}
                          onClick={() => {
                            setShowPasswordEditor(false);
                            setNewAccountPassword('');
                            setConfirmAccountPassword('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="primary"
                        type="button"
                        style={{ marginTop: '10px' }}
                        onClick={() => setShowPasswordEditor(true)}
                      >
                        Change Password
                      </button>
                    )}
                  </section>
                </div>
              </section>

              <section className="glass projectsPanel veyloCollapsibleProjects">
                <button type="button" className="veyloProjectsToggle" aria-expanded={profileProjectsOpen}
                  onClick={() => setProfileProjectsOpen(open => !open)}>
                  <span><strong>Past Projects</strong><small>{currentMember.projects.length} projects</small></span>
                  <span className={'veyloProjectsChevron' + (profileProjectsOpen ? ' expanded' : '')} aria-hidden="true">⌄</span>
                </button>
                {profileProjectsOpen && <div className="veyloProjectsExpanded">
                  <div className="veyloProjectsActionRow">
                    <span className="muted small">Your professional history</span>
                    <button type="button" className="secondary" onClick={() => setProfileAddProjectOpen(open => !open)}>
                      {profileAddProjectOpen ? 'Cancel' : '+ Add'}
                    </button>
                  </div>
                  {profileAddProjectOpen && (
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

                  <input
                    className="field projectWebsiteField"
                    type="text"
                    inputMode="url"
                    autoCapitalize="off"
                    autoCorrect="off"
                    placeholder="Business website (optional), e.g. veylonetworks.com"
                    aria-label="Website for this project"
                    value={projectDraft.website}
                    onChange={(event) =>
                      setProjectDraft((current) => ({ ...current, website: event.target.value }))
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

                  )}
                {projectLinkNotice && (
                  <p className="profileSaveNotice" role="status">{projectLinkNotice}</p>
                )}
                <div className="projectList">
                  {currentMember.projects.map((project) => (
                    <article className="projectRow veyloProjectEditor" key={project.id}>
                      <div className="veyloProjectContent">
                        <strong>{project.title}</strong>
                        <span className="muted small">
                          {project.role}
                          {project.year ? ` • ${project.year}` : ''}
                        </span>
                        <ExpandableText
                          className="muted"
                          text={project.description}
                          maxCharacters={195}
                          emptyText="No project description added."
                        />
                        {project.website && normaliseProjectWebsite(project.website) && (
                          <a
                            className="veyloProjectLink"
                            href={normaliseProjectWebsite(project.website) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit business website ↗
                          </a>
                        )}
                        <div className="veyloWebsiteEditor">
                          <input
                            className="field"
                            type="text"
                            inputMode="url"
                            autoCapitalize="off"
                            autoCorrect="off"
                            aria-label={'Website for ' + project.title}
                            placeholder="Business website link"
                            value={projectLinkEdits[project.id] ?? project.website ?? ''}
                            onChange={(event) =>
                              setProjectLinkEdits((current) => ({
                                ...current,
                                [project.id]: event.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="secondary"
                            disabled={projectLinkSavingId === project.id}
                            onClick={() => void saveProjectWebsite(project.id)}
                          >
                            {projectLinkSavingId === project.id ? 'Saving…' : 'Save link'}
                          </button>
                        </div>
                      </div>
                      <button
                        className="removeButton"
                        type="button"
                        onClick={() => void removeProject(project.id)}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
                </div>}
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

      <nav className="mobileBottomNav" aria-label="Veylo mobile navigation">
        {mobileNavPosition !== 'bottom' && <button type="button"
          className="veyloNavCollapse"
          aria-label={mobileNavCollapsed ? 'Show navigation' : 'Hide navigation'}
          aria-expanded={!mobileNavCollapsed}
          onClick={() => setMobileNavCollapsed(current => !current)}>
          <span aria-hidden="true">{mobileNavCollapsed ? (mobileNavPosition === 'right' ? '‹' : '›') : (mobileNavPosition === 'right' ? '›' : '‹')}</span>
        </button>}
        <div className="veyloNavItems">
        {MOBILE_TABS.map((tab) => {
          const selected = page === tab.id || (page === 'memberProfile' && tab.id === 'people');
          return (
            <button
              type="button"
              key={tab.id}
              className={selected ? 'mobileBottomTab active' : 'mobileBottomTab'}
              aria-label={tab.label}
              aria-current={selected ? 'page' : undefined}
              onClick={() => {
                setMobileMenuOpen(false);
                if (tab.id === 'messages' && page === 'messages' && selectedConversationId) {
                  setSelectedConversationId('');
                } else if (tab.id === 'offices' && page === 'offices' && selectedOfficeId) {
                  setSelectedOfficeId('');
                } else {
                  setPage(tab.id);
                }
              }}
            >
              <MobileNavIcon name={tab.icon} />
              {tab.id === 'messages' && unreadCount > 0 && (
                <span
                  className="veyloUnreadBadge mobileUnreadBadge"
                  aria-label={unreadCount + ' unread messages'}
                >
                  {unreadCount >= 99 ? '99+' : unreadCount}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
        </div>
      </nav>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MobileNavIcon({ name }: { name: MobileIconName }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'network' && (
        <>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v12h14V9M9 21v-8h6v8" />
        </>
      )}
      {name === 'people' && (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-2.5a5.5 5.5 0 0 1 11 0V20M16 5.5a3 3 0 0 1 0 5.8M17 14a4 4 0 0 1 3.5 4V20" />
        </>
      )}
      {name === 'messages' && (
        <>
          <path d="M4 5h16v12H8l-4 4V5Z" />
          <path d="M8 9h8M8 13h5" />
        </>
      )}
      {name === 'offices' && (
        <>
          <path d="M5 21V5l7-3 7 3v16M2 21h20M9 21v-5h6v5M9 7h.01M15 7h.01M9 11h.01M15 11h.01" />
        </>
      )}
      {name === 'vbn' && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h5v5H7zM15 8h3M15 11h3M7 16h11" />
        </>
      )}
      {name === 'profile' && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      )}
    </svg>
  );
}

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

function MessageAttachment({ message }: { message: ChatMessage }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!message.attachmentPath) return;
    let active = true;
    setUrl('');
    setError(false);
    void supabase.storage.from('message-attachments')
      .createSignedUrl(message.attachmentPath, 3600)
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data?.signedUrl) setError(true);
        else setUrl(data.signedUrl);
      });
    return () => { active = false; };
  }, [message.attachmentPath]);
  if (error) return <span className="small">Attachment unavailable</span>;
  if (!url) return <span className="small">Loading attachment…</span>;
  const image = (message.attachmentType || '').startsWith('image/');
  return <a href={url} target="_blank" rel="noopener noreferrer" download={message.attachmentName || 'attachment'}
    style={{ display: 'block', maxWidth: '100%', overflowWrap: 'anywhere' }}>
    {image ? <img src={url} alt={message.attachmentName || 'Photo'} loading="lazy"
      style={{ maxWidth: 'min(260px, 100%)', maxHeight: 280, objectFit: 'contain', borderRadius: 12, display: 'block' }} />
      : <span>📄 {message.attachmentName || 'Download file'}</span>}
  </a>;
}

function NetworkPostMedia({ post }: { post: NetworkPost }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!post.attachmentPath) return;
    let valid = true;
    void supabase.storage.from('network-attachments').createSignedUrl(post.attachmentPath, 3600).then(({data}) => {
      if (valid) setUrl(data?.signedUrl || '');
    });
    return () => { valid = false; };
  }, [post.attachmentPath]);
  if (!url) return <span className="muted small">Loading attachment…</span>;
  return <div style={{margin:'12px 0'}}>
    {post.attachmentType?.startsWith('image/') ? <img src={url} alt={post.attachmentName || 'Post photo'} style={{width:'100%',maxHeight:440,objectFit:'contain',borderRadius:12}} /> :
      post.attachmentType?.startsWith('video/') ? <video controls preload="metadata" src={url} style={{width:'100%',maxHeight:440}} /> :
      <a href={url} target="_blank" rel="noopener noreferrer">📎 {post.attachmentName || 'Open file'}</a>}
  </div>;
}

function NetworkPostText({content}:{content:string}) {
  return <>{content.split(/(https?:\/\/[^\s]+)/g).map((part,i)=>/^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{color:'#56b5ff',overflowWrap:'anywhere'}}>{part}</a> : <span key={i} style={{whiteSpace:'pre-wrap'}}>{part}</span>)}</>;
}
