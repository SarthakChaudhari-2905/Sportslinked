import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MessageCircle,
  Send,
  Search,
  Users,
} from "lucide-react";

import {
  messageApi,
} from "../../lib/endpoints";

import {
  getAccessToken,
} from "../../lib/api";

import {
  Avatar,
  Button,
  EmptyState,
  Input,
  PageSpinner,
} from "../../components/ui";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_BASE.replace(
    /\/api\/v1\/?$/,
    ""
  );

export default function Messages() {
  const [params] =
    useSearchParams();

  const requestedConversation =
    params.get("conversation");

  const [conversations, setConversations] =
    useState([]);

  const [activeId, setActiveId] =
    useState(
      requestedConversation || null
    );

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const socketRef =
    useRef(null);

  const bottomRef =
    useRef(null);

  const activeConversation =
    useMemo(
      () =>
        conversations.find(
          (c) =>
            c._id === activeId
        ),
      [
        conversations,
        activeId,
      ]
    );

  const getOtherUser = (
    conversation
  ) => {
    const token =
      localStorage.getItem(
        "sportlinked-user-id"
      );

    return (
      conversation?.participants?.find(
        (p) =>
          p._id !== token
      ) ||
      conversation?.participants?.[0]
    );
  };

  const loadConversations =
    async () => {
      const data =
        await messageApi.conversations();

      const list =
        data?.conversations ||
        [];

      setConversations(list);

      if (
        !activeId &&
        list.length
      ) {
        setActiveId(
          list[0]._id
        );
      }

      return list;
    };

  const loadMessages = async (
    conversationId
  ) => {
    if (!conversationId)
      return;

    setLoadingMessages(true);

    try {
      const data =
        await messageApi.messages(
          conversationId
        );

      setMessages(
        data?.messages || []
      );

      await messageApi.markRead(
        conversationId
      );

      setConversations(
        (items) =>
          items.map((item) =>
            item._id ===
            conversationId
              ? {
                  ...item,
                  unreadCount: 0,
                }
              : item
          )
      );
    } finally {
      setLoadingMessages(
        false
      );
    }
  };

  useEffect(() => {
    loadConversations()
      .catch(() => {})
      .finally(() =>
        setLoading(false)
      );
  }, []);

  useEffect(() => {
    if (requestedConversation) {
      setActiveId(
        requestedConversation
      );
    }
  }, [
    requestedConversation,
  ]);

  useEffect(() => {
    if (!activeId) return;

    loadMessages(
      activeId
    ).catch(() => {});

    if (socketRef.current) {
      socketRef.current.emit(
        "conversation:join",
        activeId
      );
    }
  }, [activeId]);

  useEffect(() => {
    const token =
      getAccessToken();

    if (!token) return;

    const socket = io(
      SOCKET_URL,
      {
        auth: {
          token,
        },
        transports: [
          "websocket",
        ],
      }
    );

    socketRef.current =
      socket;

    socket.on(
      "message:new",
      (message) => {
        if (
          message.conversation ===
          activeId ||
          message.conversation?._id ===
            activeId
        ) {
          setMessages(
            (items) => [
              ...items,
              message,
            ]
          );

          messageApi.markRead(
            activeId
          );
        }

        loadConversations().catch(
          () => {}
        );
      }
    );

    socket.on(
      "conversation:updated",
      () => {
        loadConversations().catch(
          () => {}
        );
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();

    const value =
      text.trim();

    if (
      !value ||
      !activeId
    ) {
      return;
    }

    setText("");

    try {
      const data =
        await messageApi.send(
          activeId,
          {
            text: value,
          }
        );

      const sent =
        data?.message;

      /*
       * Socket also emits this message.
       * Don't duplicate it if socket is active.
       */
      if (
        sent &&
        !socketRef.current?.connected
      ) {
        setMessages(
          (items) => [
            ...items,
            sent,
          ]
        );
      }

      loadConversations().catch(
        () => {}
      );
    } catch {
      setText(value);
    }
  };

  if (loading) {
    return (
      <PageSpinner label="Loading messages..." />
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] min-h-[600px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

      <div className="grid h-full md:grid-cols-[320px_1fr]">

        {/* Conversation list */}

        <aside className="border-r border-slate-200 bg-slate-50">

          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <MessageCircle
                className="text-brand-600"
                size={20}
              />

              <h1 className="text-xl font-black text-slate-900">
                Messages
              </h1>
            </div>

            <div className="relative mt-4">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                placeholder="Search conversations"
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-[calc(100%-110px)] overflow-y-auto">
            {conversations.length ===
            0 ? (
              <div className="p-5">
                <EmptyState
                  icon={Users}
                  title="No conversations"
                  description="Connect with someone from Network to start messaging."
                />
              </div>
            ) : (
              conversations.map(
                (conversation) => {
                  const other =
                    getOtherUser(
                      conversation
                    );

                  const name =
                    `${other?.firstName || ""} ${
                      other?.lastName || ""
                    }`.trim() ||
                    other?.username ||
                    "User";

                  return (
                    <button
                      key={
                        conversation._id
                      }
                      onClick={() =>
                        setActiveId(
                          conversation._id
                        )
                      }
                      className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition ${
                        activeId ===
                        conversation._id
                          ? "bg-white shadow-inner"
                          : "hover:bg-white"
                      }`}
                    >
                      <Avatar
                        name={name}
                        src={
                          other?.avatar
                        }
                        size={44}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {name}
                          </p>

                          {conversation.unreadCount >
                            0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                              {
                                conversation.unreadCount
                              }
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {conversation.lastMessageText ||
                            "Start a conversation"}
                        </p>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </aside>

        {/* Chat */}

        <main className="flex min-w-0 flex-col">

          {!activeConversation ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={
                  MessageCircle
                }
                title="Select a conversation"
                description="Choose someone from your network to start chatting."
              />
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 p-4">
                <Avatar
                  name={`${getOtherUser(activeConversation)?.firstName || ""} ${
                    getOtherUser(activeConversation)?.lastName || ""
                  }`}
                  src={
                    getOtherUser(
                      activeConversation
                    )?.avatar
                  }
                  size={42}
                />

                <div>
                  <p className="font-bold text-slate-900">
                    {getOtherUser(
                      activeConversation
                    )?.firstName}{" "}
                    {getOtherUser(
                      activeConversation
                    )?.lastName}
                  </p>

                  <p className="text-xs text-slate-400">
                    {getOtherUser(
                      activeConversation
                    )?.role}
                  </p>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
                {loadingMessages ? (
                  <PageSpinner label="Loading conversation..." />
                ) : messages.length ===
                  0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <MessageCircle
                        size={30}
                        className="mx-auto text-brand-300"
                      />

                      <p className="mt-2 font-semibold text-slate-700">
                        Start the conversation
                      </p>

                      <p className="text-sm text-slate-400">
                        Talk about trials,
                        opportunities or
                        collaborations.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map(
                    (message) => {
                      const mine =
                        message.sender?._id !==
                        getOtherUser(
                          activeConversation
                        )?._id;

                      return (
                        <div
                          key={
                            message._id
                          }
                          className={`flex ${
                            mine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              mine
                                ? "rounded-br-md bg-brand-600 text-white"
                                : "rounded-bl-md bg-white text-slate-700 shadow-sm"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      );
                    }
                  )
                )}

                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={send}
                className="border-t border-slate-200 bg-white p-4"
              >
                <div className="flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) =>
                      setText(
                        e.target.value
                      )
                    }
                    placeholder="Write a professional message..."
                    className="rounded-2xl"
                  />

                  <Button
                    type="submit"
                    className="rounded-2xl px-5"
                    disabled={
                      !text.trim()
                    }
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}