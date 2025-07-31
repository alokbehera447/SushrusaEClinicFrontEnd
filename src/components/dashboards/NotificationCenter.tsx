import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
// import { notificationApi, Notification } from '@/lib/api';

export interface Notification {
  id: string;
  type: 'critical' | 'important' | 'info' | 'success';
  title: string;
  message: string;
  category: 'system' | 'doctors' | 'clinics' | 'payments' | 'analytics' | 'security';
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, isDarkMode = false }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock notifications for now
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'critical',
      title: 'System Error Detected',
      message: 'Database connection timeout occurred.',
      category: 'system',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      actionRequired: true
    },
    {
      id: '2',
      type: 'important',
      title: 'New Doctor Registration',
      message: 'Dr. Sarah Johnson has registered and is pending verification.',
      category: 'doctors',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isRead: false,
      actionRequired: true
    },
    {
      id: '3',
      type: 'success',
      title: 'Payment Processed',
      message: 'Payment of ₹2,500 received for consultation.',
      category: 'payments',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: true
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'important': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <Check className="w-5 h-5 text-green-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = async (notificationId: string) => {
    // Commented out API call for now
    // try {
    //   await notificationApi.markAsRead(notificationId);
    // } catch (error) {
    //   console.error('Failed to mark notification as read:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to mark notification as read.",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const markAllAsRead = async () => {
    // Commented out API call for now
    // try {
    //   await notificationApi.markAllAsRead();
    // } catch (error) {
    //   console.error('Failed to mark all notifications as read:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to mark all notifications as read.",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl w-full p-0 max-h-[80vh] flex flex-col transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : ''
      }`}>
        <DialogHeader className={`p-6 pb-4 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-[#E17726]" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <DialogTitle className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-midnight'
                }`}>
                  Notification Center
                </DialogTitle>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {unreadCount} unread notifications
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
              <p className={`transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.isRead 
                      ? isDarkMode ? 'ring-2 ring-blue-400' : 'ring-2 ring-blue-200'
                      : ''
                  } ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={isDarkMode ? 'bg-gray-700' : 'bg-white'}>
                          {getNotificationIcon(notification.type)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              New
                            </Badge>
                          )}
                          {notification.actionRequired && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm mb-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className={`flex items-center gap-4 text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                          <Badge variant="outline" className={`text-xs ${
                            isDarkMode ? 'border-gray-600 text-gray-300' : ''
                          }`}>
                            {notification.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter; 