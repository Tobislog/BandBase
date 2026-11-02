import { useEffect, useState } from "react";
import { ShieldCheck, Users } from "lucide-react";
import PageHeading from "../components/PageHeading";
import BasicTile from "../components/BasicTile";
import { useAuth } from "../context/AuthProvider";
import { useBand } from "../context/BandProvider";
import { getMemberships, updateMembershipRole } from "../services/bandService";

const ROLE_LABELS = {
    owner: 'Owner',
    admin: 'Admin',
    moderator: 'Moderator',
    member: 'Member',
};

const ROLE_BADGE_STYLES = {
    owner: 'border-brand/30 bg-brand/15 text-brand',
    admin: 'border-gig/30 bg-gig/15 text-gig',
    moderator: 'border-rehearsal/40 bg-rehearsal/20 text-copy',
    member: 'border-line bg-line/40 text-copy',
};

const MANAGED_ROLES = ['owner', 'admin', 'moderator', 'member'];

const PERMISSION_ROWS = [
    {
        label: 'Events, Songs & Setlists verwalten',
        values: { owner: 'Ja', admin: 'Ja', moderator: 'Ja', member: 'Nein' },
    },
    {
        label: 'Nachrichten in Event-Channels',
        values: { owner: 'Ja', admin: 'Ja', moderator: 'Ja', member: 'Ja' },
    },
    {
        label: 'Custom-Channels',
        values: { owner: 'Alle', admin: 'Alle', moderator: 'Zugewiesen', member: 'Zugewiesen' },
    },
    {
        label: 'Rollen vergeben',
        values: { owner: 'Alle', admin: 'Moderator/Member', moderator: 'Nein', member: 'Nein' },
    },
    {
        label: 'Ownership übertragen',
        values: { owner: 'Ja', admin: 'Nein', moderator: 'Nein', member: 'Nein' },
    },
];

const getMemberName = (member) => {
    return [member.firstName, member.lastName].filter(Boolean).join(' ') || 'Unbenannt';
};

const getInitials = (member) => {
    const initials = `${member.firstName?.charAt(0) ?? ''}${member.lastName?.charAt(0) ?? ''}`.toUpperCase();
    return initials || '?';
};

function RoleBadge ({ role }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES.member}`}>
            {ROLE_LABELS[role] ?? role}
        </span>
    );
}

function PermissionMatrix () {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
                <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-copy/60">
                        <th className="px-4 py-3 font-medium">Berechtigung</th>
                        {MANAGED_ROLES.map((role) => (
                            <th key={role} className="px-4 py-3 text-center font-medium">
                                <RoleBadge role={role} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {PERMISSION_ROWS.map((row) => (
                        <tr key={row.label} className="border-b border-line last:border-none">
                            <td className="px-4 py-3 text-copy">{row.label}</td>
                            {MANAGED_ROLES.map((role) => (
                                <td key={role} className="whitespace-nowrap px-4 py-3 text-center text-xs text-copy/80">
                                    {row.values[role]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Members () {
    const { user } = useAuth();
    const { activeBandId, band, isOwner, isAdmin, refreshBands } = useBand();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingUserId, setSavingUserId] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!activeBandId) {
                if (cancelled) return;
                setMembers([]);
                setError('');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const nextMembers = await getMemberships(activeBandId);
                if (cancelled) return;
                setMembers(nextMembers);
            } catch (err) {
                if (cancelled) return;
                setMembers([]);
                setError(err.message || 'Mitglieder konnten nicht geladen werden.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [activeBandId]);

    const assignableRoles = (member) => {
        if (!isOwner && !isAdmin) return [];
        if (String(member.userId) === String(user?.id)) return [];
        if (member.role === 'owner') return [];
        if (isOwner) return MANAGED_ROLES;
        return ['member', 'moderator'];
    };

    const handleRoleChange = async (member, nextRole) => {
        if (!activeBandId || nextRole === member.role) return;

        if (nextRole === 'owner') {
            const confirmed = window.confirm(
                `Ownership an ${getMemberName(member)} übertragen? Du wirst danach Admin.`
            );
            if (!confirmed) return;
        }

        setSavingUserId(member.userId);
        setError('');

        try {
            const updated = await updateMembershipRole(activeBandId, member.userId, nextRole);

            setMembers((current) => current.map((item) => {
                if (String(item.userId) === String(updated.userId)) {
                    return { ...item, role: updated.role };
                }
                if (nextRole === 'owner' && String(item.userId) === String(user?.id)) {
                    return { ...item, role: 'admin' };
                }
                return item;
            }));

            if (nextRole === 'owner') {
                await refreshBands();
            }
        } catch (err) {
            setError(err.message || 'Rolle konnte nicht geändert werden.');
        } finally {
            setSavingUserId(null);
        }
    };

    return (
        <div>
            <PageHeading
                title="Members"
                subtitle={band
                    ? `Mitglieder und Berechtigungen der Band ${band.name} verwalten.`
                    : 'Mitglieder und Berechtigungen verwalten.'}
            />

            {error && (
                <div className="mb-4 rounded-md border border-red-500/40 bg-red-400/10 px-3 py-2 text-sm text-red-500">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm">
                    Lade Mitglieder...
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <BasicTile
                        title="Band Members"
                        icon={<Users />}
                        button={(
                            <span className="text-xs text-copy/60">
                                {members.length} {members.length === 1 ? 'Mitglied' : 'Mitglieder'}
                            </span>
                        )}
                    >
                        {members.length === 0 ? (
                            <div className="px-4 py-10 text-center text-sm text-copy/60">
                                Keine Mitglieder gefunden.
                            </div>
                        ) : (
                            <div className="divide-y divide-line">
                                {members.map((member) => {
                                    const roles = assignableRoles(member);
                                    const isCurrentUser = String(member.userId) === String(user?.id);
                                    const name = getMemberName(member);

                                    return (
                                        <div key={member.userId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                                            <div
                                                style={{ backgroundColor: member.color }}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-heading"
                                            >
                                                {getInitials(member)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-sm font-medium text-heading">{name}</p>
                                                    {isCurrentUser && (
                                                        <span className="rounded bg-line/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-copy">
                                                            Du
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-xs text-copy/60">
                                                    {isCurrentUser ? 'Das bist du.' : 'Bandmitglied'}
                                                </p>
                                            </div>

                                            <RoleBadge role={member.role} />

                                            {roles.length > 0 && (
                                                <select
                                                    value={member.role}
                                                    onChange={(event) => handleRoleChange(member, event.target.value)}
                                                    disabled={savingUserId !== null}
                                                    aria-label={`Rolle von ${name} ändern`}
                                                    className="rounded-md border border-line bg-surface px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {roles.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role === 'owner' ? 'Owner (übertragen)' : ROLE_LABELS[role]}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </BasicTile>

                    <BasicTile title="Rollen & Rechte" icon={<ShieldCheck />}>
                        <PermissionMatrix />
                    </BasicTile>
                </div>
            )}
        </div>
    );
}
