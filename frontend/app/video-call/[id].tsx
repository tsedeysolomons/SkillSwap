import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageCircle,
  Users,
} from "lucide-react-native";
import { useSkillSwap } from "@/hooks/use-skillswap-store";
import { SkillSwapColors } from "@/constants/skillswap-colors";

export default function VideoCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions, currentUser } = useSkillSwap();
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [callDuration, setCallDuration] = useState<number>(0);

  const session = sessions.find((s : any) => s.id === id);

  useEffect(() => {
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </SafeAreaView>
    );
  }

  const isTeacher = session.teacherId === currentUser?.id;
  const otherUser = isTeacher ? session.learner : session.teacher;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    Alert.alert("End Call", "Are you sure you want to end this session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Call",
        style: "destructive",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Video Area */}
      <View style={styles.videoContainer}>
        <View style={styles.remoteVideo}>
          <View style={styles.videoPlaceholder}>
            <Users size={64} color={SkillSwapColors.white} />
            <Text style={styles.participantName}>{otherUser?.name}</Text>
          </View>
        </View>

        <View style={styles.localVideo}>
          <View style={styles.localVideoPlaceholder}>
            <Text style={styles.localVideoText}>You</Text>
          </View>
        </View>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{session.skill?.name}</Text>
        <Text style={styles.sessionDuration}>
          {formatDuration(callDuration)}
        </Text>
        <Text style={styles.sessionRole}>
          {isTeacher ? "Teaching" : "Learning from"} {otherUser?.name}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, !isAudioOn && styles.controlButtonOff]}
          onPress={() => setIsAudioOn(!isAudioOn)}
        >
          {isAudioOn ? (
            <Mic size={24} color={SkillSwapColors.white} />
          ) : (
            <MicOff size={24} color={SkillSwapColors.white} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isVideoOn && styles.controlButtonOff]}
          onPress={() => setIsVideoOn(!isVideoOn)}
        >
          {isVideoOn ? (
            <Video size={24} color={SkillSwapColors.white} />
          ) : (
            <VideoOff size={24} color={SkillSwapColors.white} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <MessageCircle size={24} color={SkillSwapColors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Phone size={24} color={SkillSwapColors.white} />
        </TouchableOpacity>
      </View>

      {/* Demo Notice */}
      <View style={styles.demoNotice}>
        <Text style={styles.demoText}>
          🎥 This is a demo video call interface. In a real app, this would
          integrate with a video calling service like Agora, Twilio, or WebRTC.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SkillSwapColors.black,
  },
  videoContainer: {
    flex: 1,
    position: "relative",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: SkillSwapColors.text,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SkillSwapColors.primary,
  },
  participantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: SkillSwapColors.white,
    marginTop: 16,
  },
  localVideo: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
  },
  localVideoPlaceholder: {
    flex: 1,
    backgroundColor: SkillSwapColors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  localVideoText: {
    color: SkillSwapColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  sessionInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
    alignItems: "center",
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: SkillSwapColors.white,
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 18,
    color: SkillSwapColors.accent,
    fontWeight: "600",
    marginBottom: 4,
  },
  sessionRole: {
    fontSize: 16,
    color: SkillSwapColors.white,
    opacity: 0.8,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonOff: {
    backgroundColor: SkillSwapColors.error,
  },
  endCallButton: {
    backgroundColor: SkillSwapColors.error,
  },
  demoNotice: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  demoText: {
    color: SkillSwapColors.white,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: SkillSwapColors.error,
    textAlign: "center",
    marginTop: 50,
  },
});
