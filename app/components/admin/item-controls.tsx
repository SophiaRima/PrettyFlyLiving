import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";
import type { FormEvent } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import type { AdminActionResult } from "~/lib/forms";

import { useSuccessToast } from "./form-fields";

/** Move up / move down / delete buttons for one item in a sorted list. */
export function ItemControls({
  id,
  index,
  count,
  confirmDelete,
}: {
  id: number;
  index: number;
  count: number;
  /** Question shown before deleting. */
  confirmDelete: string;
}) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const busy = fetcher.state !== "idle";

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === "delete" && !window.confirm(confirmDelete)) {
      event.preventDefault();
    }
  }

  return (
    <fetcher.Form method="post" onSubmit={onSubmit} className="flex items-center gap-1">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" name="intent" value="move-up" variant="ghost" size="icon-sm" disabled={busy || index === 0} aria-label="Move up">
        <ArrowUpIcon />
      </Button>
      <Button type="submit" name="intent" value="move-down" variant="ghost" size="icon-sm" disabled={busy || index === count - 1} aria-label="Move down">
        <ArrowDownIcon />
      </Button>
      <Button type="submit" name="intent" value="delete" variant="ghost" size="icon-sm" disabled={busy} aria-label="Delete" className="text-destructive">
        <Trash2Icon />
      </Button>
    </fetcher.Form>
  );
}
