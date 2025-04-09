
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FarmerMessages = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { conversations, currentMessages, loading, error, sendMessage, fetchMessages, fetchConversations } = useMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  useEffect(() => {
    // Refetch conversations periodically
    const interval = setInterval(() => {
      if (profile?.id) {
        fetchConversations();
      }
    }, 30000); // every 30 seconds
    
    return () => clearInterval(interval);
  }, [profile?.id, fetchConversations]);

  if (loading && conversations.length === 0) {
    return (
      <DashboardLayout userRole="farmer">
        <DashboardHeader title="Messages" userName={profile?.name || ""} userRole="farmer" />
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="farmer">
        <DashboardHeader title="Messages" userName={profile?.name || ""} userRole="farmer" />
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    await sendMessage(selectedChat, newMessage.trim());
    setNewMessage("");
  };

  const handleSelectChat = (userId: string) => {
    setSelectedChat(userId);
    fetchMessages(userId);
  };

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Messages" userName={profile?.name || ""} userRole="farmer" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Chat with traders and other farmers</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat === conversation.id
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelectChat(conversation.id)}
                    >
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.user.name}`} />
                        <AvatarFallback>
                          {conversation.user.name.split(' ').map(name => name[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium truncate">{conversation.user.name}</h4>
                            <span className="text-xs text-muted-foreground">{conversation.user.role}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No conversations found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              {selectedChat
                ? `Chat with ${conversations.find(c => c.id === selectedChat)?.user.name}`
                : "Select a conversation to start chatting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {selectedChat ? (
              <>
                <ScrollArea className="flex-1 mb-4 pr-4">
                  <div className="space-y-4 p-4">
                    {currentMessages.length > 0 ? (
                      currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`rounded-lg py-2 px-4 max-w-[80%] ${
                              message.sender_id === profile?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.content}</p>
                            <span className="text-xs opacity-70">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="flex gap-2 p-4 pt-0">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerMessages;
