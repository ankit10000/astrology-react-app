import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import SpaceSky from '../../components/decorations/space-sky';
import MainNav from '../../components/navs/main-nav';
import ShadowHeadline from '../../components/paper/shadow-headline';
import { useGlobals } from '../../contexts/global';
import api from '../../services/api';

function ChatScreen({ navigation }) {
  const [{ session }] = useGlobals();
  const { colors } = useTheme();
  const [messages, setMessages] = React.useState([]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const flatListRef = React.useRef(null);

  React.useEffect(() => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: `Hello ${session.name}! I am your personal astrology assistant. As a ${session.sign}, I can help you understand your daily horoscope, compatibility, and more. What would you like to know?`,
      },
    ]);
  }, [session.name, session.sign]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const context = {
        name: session.name,
        sign: session.sign,
        birthDate: session.birthDate,
        sex: session.sex,
        relationship: session.relationship,
        number: session.number,
      };
      const result = await api.chat.sendMessage(inputText.trim(), context);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            err.message?.includes('busy')
              ? 'The stars are busy right now. Please try again in a moment.'
              : 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.aiBubble, { backgroundColor: colors.surfaceVariant }],
        ]}
      >
        <Text
          style={{
            color: isUser ? colors.onPrimary : colors.onSurfaceVariant,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <>
      <SpaceSky />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <MainNav />
          <ShadowHeadline style={styles.headline}>
            Ask AI
          </ShadowHeadline>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            style={styles.flatList}
            keyboardShouldPersistTaps="handled"
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <Text style={{ marginLeft: 8, opacity: 0.6 }}>
                Loading...
              </Text>
            </View>
          )}
          <View
            style={[
              styles.inputContainer,
              { borderTopColor: colors.outlineVariant },
            ]}
          >
            <TextInput
              mode="outlined"
              placeholder="Ask about your horoscope..."
              value={inputText}
              onChangeText={setInputText}
              style={styles.input}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              dense
            />
            <IconButton
              icon="send"
              mode="contained"
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={styles.sendButton}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 8,
  },
  headline: {
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
});

export default ChatScreen;
