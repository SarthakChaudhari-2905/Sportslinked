import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Check,
  X,
  MessageCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  connectionApi,
  messageApi,
} from "../../lib/endpoints";

import {
  Card,
  Avatar,
  Badge,
  Button,
  PageSpinner,
  EmptyState,
} from "../../components/ui";

import { getErrorMessage } from "../../lib/api";

export default function Network() {
  const [connections, setConnections] =
    useState([]);

  const [suggestions, setSuggestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        connectionData,
        suggestionData,
      ] = await Promise.all([
        connectionApi.mine(),
        connectionApi.suggestions({
          limit: 12,
        }),
      ]);

      setConnections(
        connectionData?.connections ||
          []
      );

      setSuggestions(
        suggestionData?.suggestions ||
          []
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (id) => {
    try {
      await connectionApi.accept(id);
      load();
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  };

  const reject = async (id) => {
    try {
      await connectionApi.reject(id);
      load();
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  };

  const connect = async (
    userId
  ) => {
    try {
      await connectionApi.request(
        userId
      );

      setSuggestions((items) =>
        items.filter(
          (item) =>
            item.user?._id !== userId
        )
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  };

  const messageUser = async (
    userId
  ) => {
    try {
      const data =
        await messageApi.createConversation(
          userId
        );

      const id =
        data?.conversation?._id ||
        data?._id;

      if (id) {
        window.location.href =
          `/messages?conversation=${id}`;
      }
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  };

  if (loading) {
    return (
      <PageSpinner label="Building your network..." />
    );
  }

  const incoming =
    connections.filter(
      (c) =>
        c.direction === "INCOMING" &&
        c.status === "PENDING"
    );

  const accepted =
    connections.filter(
      (c) =>
        c.status === "ACCEPTED"
    );

  return (
    <div className="space-y-6">

      {/* Hero */}

      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-brand-300">
            <Sparkles size={17} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Your sports network
            </span>
          </div>

          <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
            Build relationships that move your sports career forward.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Connect with athletes, scouts, clubs,
            academies and agencies. Discover people
            beyond your existing circle.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Requests */}

      {incoming.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <UserPlus
              size={18}
              className="text-brand-600"
            />

            <h2 className="font-bold text-slate-900">
              Connection requests
            </h2>

            <Badge tone="brand">
              {incoming.length}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {incoming.map(
              (connection) => {
                const user =
                  connection.otherUser;

                const name =
                  `${user?.firstName || ""} ${
                    user?.lastName || ""
                  }`.trim() ||
                  user?.username;

                return (
                  <Card
                    key={
                      connection._id
                    }
                    className="p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={name}
                        src={user?.avatar}
                        size={48}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">
                          {name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {user?.role}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() =>
                          accept(
                            connection._id
                          )
                        }
                      >
                        <Check size={15} />
                        Accept
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          reject(
                            connection._id
                          )
                        }
                      >
                        <X size={15} />
                        Ignore
                      </Button>
                    </div>
                  </Card>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* Suggestions */}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Recommended
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-900">
            People you may know
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Expand your sports network with relevant people.
          </p>
        </div>

        {suggestions.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Your network is growing"
            description="We'll show more recommendations as your sports profile develops."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {suggestions.map(
              (item) => {
                const u =
                  item.user || {};

                const name =
                  `${u.firstName || ""} ${
                    u.lastName || ""
                  }`.trim() ||
                  u.username ||
                  "User";

                return (
                  <Card
                    key={u._id}
                    className="group overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-20 bg-gradient-to-br from-brand-600 via-blue-600 to-slate-950" />

                    <div className="px-5 pb-5">
                      <div className="-mt-7">
                        <Avatar
                          name={name}
                          src={u.avatar}
                          size={60}
                        />
                      </div>

                      <div className="mt-3">
                        <Link
                          to={
                            u.role ===
                            "ATHLETE"
                              ? `/athletes/${u._id}`
                              : `/`
                          }
                          className="font-bold text-slate-900 hover:text-brand-700"
                        >
                          {name}
                        </Link>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {u.role}
                        </p>

                        {item.profile && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge tone="brand">
                              {item.profile.primarySport}
                            </Badge>

                            <Badge>
                              {item.profile.playingLevel}
                            </Badge>
                          </div>
                        )}

                        <p className="mt-3 text-xs text-slate-400">
                          {item.reason}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() =>
                            connect(
                              u._id
                            )
                          }
                        >
                          <UserPlus size={15} />
                          Connect
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() =>
                            messageUser(
                              u._id
                            )
                          }
                        >
                          <MessageCircle size={15} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* Connections */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Network
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Your connections
            </h2>
          </div>

          <Badge tone="green">
            {accepted.length} connected
          </Badge>
        </div>

        {accepted.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No connections yet"
            description="Start connecting with athletes, scouts and organizations above."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accepted.map(
              (connection) => {
                const u =
                  connection.otherUser;

                const name =
                  `${u?.firstName || ""} ${
                    u?.lastName || ""
                  }`.trim() ||
                  u?.username;

                return (
                  <Card
                    key={
                      connection._id
                    }
                    className="p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={name}
                        src={u?.avatar}
                        size={44}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">
                          {name}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <ShieldCheck size={12} />
                          {u?.role}
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          messageUser(
                            u._id
                          )
                        }
                      >
                        <MessageCircle
                          size={15}
                        />
                      </Button>
                    </div>
                  </Card>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}