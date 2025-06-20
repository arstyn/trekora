'use client';
import { useState } from 'react';
import { useNotifications } from '../hooks/use-notifications';
import { Button } from './ui/button';
import { MailIcon } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function NotificationButton() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0 relative"
          variant="outline"
          aria-label="Open notifications"
        >
          <MailIcon />
          <span className="sr-only">Inbox</span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 px-2 py-0.5 text-xs rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-xs sm:max-w-md">
        <Card className="shadow-none border-none bg-transparent p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Stay up to date with your latest notifications.
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-0" />
          <CardContent className="max-h-80 overflow-y-auto p-0">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No notifications
              </div>
            ) : (
              <div className="flex flex-col divide-y">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full text-left px-6 py-4 bg-transparent hover:bg-accent transition-colors focus:outline-none ${n.isRead ? 'font-normal bg-muted' : 'font-semibold bg-primary/5'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{n.message}</span>
                      {!n.isRead && (
                        <Badge variant="default" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
