import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, GripVertical } from 'lucide-react';
import type { LinktreeItem } from '@/types/linktree';

interface SortableLinkRowProps {
  link: LinktreeItem;
  index: number;
  totalLinks: number;
  handleToggleLink: (link: LinktreeItem) => void;
  handleMoveLink: (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  setLinkToEdit: (link: LinktreeItem) => void;
  setIsLinktreeEditorOpen: (isOpen: boolean) => void;
  handleDeleteLink: (id: string) => void;
  deletingLinkId: string | null;
}

export function SortableLinkRow({
  link,
  index,
  totalLinks,
  handleToggleLink,
  handleMoveLink,
  setLinkToEdit,
  setIsLinktreeEditorOpen,
  handleDeleteLink,
  deletingLinkId
}: SortableLinkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-zinc-50/70 transition-colors ${isDragging ? 'bg-zinc-100 shadow-md' : ''}`}
    >
      {/* Drag Handle */}
      <td className="py-3 pl-4 pr-2 w-8">
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-400 hover:text-zinc-700 cursor-grab active:cursor-grabbing p-1 rounded transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="py-3 px-4">
        <span className="font-bold text-zinc-900">{link.title}</span>
      </td>
      <td className="py-3 px-4 text-zinc-600 capitalize">{link.iconType}</td>
      <td className="py-3 px-4 text-zinc-600">{link.order}</td>
      <td className="py-3 px-4 text-zinc-600">{link.clickCount || 0}</td>
      <td className="py-3 px-4">
        <button
          onClick={() => handleToggleLink(link)}
          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
            link.isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-zinc-100 text-zinc-500 border border-zinc-200"
          }`}
        >
          {link.isActive ? "ACTIVE" : "HIDDEN"}
        </button>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end space-x-1 sm:space-x-1.5">
          {/* Quick Actions */}
          <button
            onClick={() => handleMoveLink(index, 'top')}
            disabled={index === 0}
            className="p-1 text-zinc-400 hover:text-brand rounded hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-20"
            title="Move to Top"
          >
            <ChevronsUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleMoveLink(index, 'up')}
            disabled={index === 0}
            className="p-1 text-zinc-400 hover:text-brand rounded hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-20"
            title="Move Up"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleMoveLink(index, 'down')}
            disabled={index === totalLinks - 1}
            className="p-1 text-zinc-400 hover:text-brand rounded hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-20"
            title="Move Down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleMoveLink(index, 'bottom')}
            disabled={index === totalLinks - 1}
            className="p-1 text-zinc-400 hover:text-brand rounded hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-20"
            title="Move to Bottom"
          >
            <ChevronsDown className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => {
              setLinkToEdit(link);
              setIsLinktreeEditorOpen(true);
            }}
            className="p-1 text-zinc-400 hover:text-brand rounded hover:bg-zinc-100 transition-colors cursor-pointer ml-1 sm:ml-2"
            title="Edit Link"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteLink(link.id)}
            disabled={deletingLinkId === link.id}
            className="p-1 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Delete Link"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
