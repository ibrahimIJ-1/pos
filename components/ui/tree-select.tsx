
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, ChevronRight, Check } from "lucide-react";

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

interface TreeSelectProps {
  data: TreeNode[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TreeSelect({
  data,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: TreeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(
    new Set()
  );

  // Function to find the node by id recursively
  const findNodeNameById = (nodes: TreeNode[], id: string): string | null => {
    for (const node of nodes) {
      if (node.id === id) return node.name;
      if (node.children?.length) {
        const found = findNodeNameById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNodes = (nodes: TreeNode[], level = 0) => {
    return nodes.map((node) => (
      <React.Fragment key={node.id}>
        <CommandItem
          value={node.id}
          onSelect={() => {
            onChange(node.id);
            setOpen(false);
          }}
          className={cn(
            "flex items-center",
            level > 0 ? `pl-${level * 4 + 3}` : ""
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          {node.children?.length ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
            >
              {expandedNodes.has(node.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <span className="w-6" />
          )}
          <span>{node.name}</span>
          {value === node.id && <Check className="ml-auto h-4 w-4" />}
        </CommandItem>
        {node.children?.length && expandedNodes.has(node.id) && 
          renderTreeNodes(node.children, level + 1)
        }
      </React.Fragment>
    ));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between neon-input transition-shadow duration-300",
            className
          )}
        >
          {value ? findNodeNameById(data, value) : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {renderTreeNodes(data)}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
