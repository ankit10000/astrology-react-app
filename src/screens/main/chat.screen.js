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

import SpaceSky from '../../components/decorations/space-sky';
import MainNav from '../../components/navs/main-nav';
import ShadowHeadline from '../../components/paper/shadow-headline';
import { useGlobals } from '../../contexts/global';
import i18n from '../../i18n';
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
        content: i18n.t('chat_welcome', {
          name: session.name,
          sign: i18n.t(session.sign),
        }),
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
      const { response } = await api.chat.sendMessage(
        inputText.trim(),
        context,
        session.language
      );
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: i18n.t('Something is wrong'),
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SpaceSky />
      <MainNav />
      <ShadowHeadline style={styles.headline}>
        {i18n.t('Ask AI')}
      </ShadowHeadline>
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
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <Text style={{ marginLeft: 8, opacity: 0.6 }}>
            {i18n.t('Loading')}...
          </Text>
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View
          style={[
            styles.inputContainer,
            { borderTopColor: colors.outlineVariant },
          ]}
        >
          <TextInput
            mode="outlined"
            placeholder={i18n.t('chat_placeholder')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 8,
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
