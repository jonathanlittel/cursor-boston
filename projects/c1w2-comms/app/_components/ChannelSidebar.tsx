import { DEFAULT_CHANNELS, type ChannelId } from "@/lib/comms";

interface ChannelSidebarProps {
  activeChannelId: ChannelId;
  onSelect: (channelId: ChannelId) => void;
}

export function ChannelSidebar({
  activeChannelId,
  onSelect,
}: ChannelSidebarProps) {
  return (
    <aside className="sidebar" aria-label="Channels">
      <h2>Channels</h2>
      <ul>
        {DEFAULT_CHANNELS.map((channel) => {
          const active = channel.id === activeChannelId;

          return (
            <li key={channel.id}>
              <button
                type="button"
                className={active ? "channel active" : "channel"}
                onClick={() => onSelect(channel.id)}
              >
                <span>#{channel.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
