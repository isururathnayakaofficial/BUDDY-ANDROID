import React, { useState } from 'react';
import {auth,db} from "../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

type AuthMode = 'signIn' | 'signUp';

export default function HomeScreen() {
  const [mode, setMode] = useState<AuthMode>('signIn');

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const isSignUp = mode === 'signUp';


  const sign_in = async () => {

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user = userCredential.user;


    console.log(
      "Logged in:",
      user.uid
    );
    console.log("successfully logged in user:", user);
    router.push("../home");


  } catch(error:any){

    console.log(
      "Login error:",
      error.message
    );

  }

};

  const sign_up = async () => {
  try {

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    console.log("User UID:", user.uid);

    const userDoc = doc(db, "users", user.uid);

    console.log("Document reference:", userDoc);

    await setDoc(userDoc, {
      uid: user.uid,
      name,
      email,
      createdAt: new Date(),
    });

    console.log("Firestore saved");
    router.push("../home");

  } catch (error: any) {
    console.log("Signup error:", error.message);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'android' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.brandMark}>
              <Text style={styles.brandLetter}>b</Text>
            </View>

            <Text style={styles.appName}>buddy</Text>
            <Text style={styles.tagline}>
              Hay, I’m Buddy! I’m here to help you stay connected with your friends and family.
            </Text>

            <View style={styles.clipArt}>
              <View style={[styles.sparkle, styles.sparkleOne]} />
              <View style={[styles.sparkle, styles.sparkleTwo]} />
              <View style={styles.orbit} />

              <View style={styles.character}>
                <View style={styles.earLeft} />
                <View style={styles.earRight} />

                <View style={styles.face}>
                  <View style={styles.eyeRow}>
                    <View style={styles.eye} />
                    <View style={styles.eye} />
                  </View>

                  <View style={styles.smile} />
                </View>
              </View>

              <View style={styles.heart}>
                <Text style={styles.heartText}>♥</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>

            <Text style={styles.supportingText}>
              {isSignUp
                ? 'Join Buddy and keep your people close.'
                : 'Sign in to continue to Buddy.'}
            </Text>

            {isSignUp && (
              <Field
                label="Name"
                placeholder="Your name"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            )}

            <Field
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Field
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
  style={styles.primaryButton}
  onPress={isSignUp ? sign_up : sign_in}
>
              <Text style={styles.primaryButtonText}>
                {isSignUp ? 'Create account' : 'Sign in'}
              </Text>
            </Pressable>

            {!isSignUp ? (
              <>
                <Text style={styles.terms}>Forgot your password?</Text>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>
                    Don't have an account?
                  </Text>

                  <Pressable onPress={() => setMode('signUp')}>
                    <Text style={styles.switchButton}> Sign Up</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.terms}>
                  By signing up, you agree to our Terms and Privacy Policy.
                </Text>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>
                    Already have an account?
                  </Text>

                  <Pressable onPress={() => setMode('signIn')}>
                    <Text style={styles.switchButton}> Sign In</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  ...inputProps
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        placeholderTextColor="#A6A6A6"
        autoCorrect={false}
        {...inputProps}
      />
    </View>
  );
}

const ORANGE = '#F47A21';

const styles = StyleSheet.create({
  flex: { flex: 1 },

  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F1',
  },

  content: {
    flexGrow: 1,
    paddingBottom: 28,
  },

  hero: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 24,
  },

  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  brandLetter: {
    color: '#FFFFFF',
    fontSize: 39,
    lineHeight: 43,
    fontWeight: '800',
    marginTop: -3,
  },

  appName: {
    color: '#24211F',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 9,
  },

  tagline: {
    color: '#77706B',
    fontSize: 15,
    marginTop: 5,
  },

  clipArt: {
    width: 246,
    height: 178,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  orbit: {
    position: 'absolute',
    width: 202,
    height: 125,
    borderRadius: 100,
    backgroundColor: '#FFE4D0',
    bottom: 5,
  },

  character: {
    width: 112,
    height: 130,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
  },

  earLeft: {
    position: 'absolute',
    left: 3,
    top: 31,
    width: 39,
    height: 48,
    borderRadius: 22,
    backgroundColor: '#F7B64F',
    transform: [{ rotate: '-28deg' }],
  },

  earRight: {
    position: 'absolute',
    right: 3,
    top: 31,
    width: 39,
    height: 48,
    borderRadius: 22,
    backgroundColor: '#F7B64F',
    transform: [{ rotate: '28deg' }],
  },

  face: {
    width: 96,
    height: 100,
    borderRadius: 46,
    backgroundColor: '#FFC966',
    alignItems: 'center',
    paddingTop: 39,
    zIndex: 1,
  },

  eyeRow: {
    flexDirection: 'row',
    gap: 27,
  },

  eye: {
    width: 8,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#573D2B',
  },

  smile: {
    width: 27,
    height: 13,
    borderBottomWidth: 4,
    borderColor: '#573D2B',
    borderRadius: 20,
    marginTop: 9,
  },

  heart: {
    position: 'absolute',
    right: 25,
    top: 23,
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },

  heartText: {
    color: ORANGE,
    fontSize: 20,
    marginTop: 1,
  },

  sparkle: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 3,
    backgroundColor: ORANGE,
    transform: [{ rotate: '45deg' }],
  },

  sparkleOne: {
    left: 27,
    top: 37,
  },

  sparkleTwo: {
    right: 11,
    bottom: 57,
    backgroundColor: '#F7B64F',
    width: 8,
    height: 8,
  },

  card: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    shadowColor: '#6B4330',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 3,
  },

  heading: {
    color: '#282321',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  supportingText: {
    color: '#7E7671',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    color: '#4C4540',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    height: 51,
    borderWidth: 1,
    borderColor: '#E9E2DE',
    borderRadius: 13,
    paddingHorizontal: 15,
    color: '#2D2926',
    fontSize: 15,
    backgroundColor: '#FFFEFD',
  },

  primaryButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 3,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  terms: {
    color: '#A17861',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 17,
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  switchText: {
    color: '#666',
    fontSize: 14,
  },

  switchButton: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: '700',
  },
});