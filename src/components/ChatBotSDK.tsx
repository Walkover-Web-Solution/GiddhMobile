import { APP_EVENTS, STORAGE_KEYS } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import JWT from 'expo-jwt';
import { BOT_JWT_SECRET } from '@/env.json';
import { SupportedAlgorithms } from 'expo-jwt/dist/types/algorithms';
// import ChatBot from "chatbot-react-native-sdk";
import { DeviceEventEmitter } from "react-native";

const ChatBotSDK = () => {
    const [chatBotConfig, setChatBotConfig] = useState({
        jwt: '',
        threadId: '',
        variables: {
            env: 'prod',
            session: '',
            activeCompanyUniqueName: ''
        }
    });

    useEffect(() => {
        const setJWTPayload = async () => {
            const activeCompanyUniqueName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
            const userName = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
            const session = await AsyncStorage.getItem(STORAGE_KEYS.token);
        
            const jwtPayload = {
              org_id: "11621",
              chatbot_id: "67481ba0c961a449d73d016f",
              user_id: `${activeCompanyUniqueName}${userName}`
            }
        
            const jwtToken = JWT.encode(jwtPayload, BOT_JWT_SECRET, { algorithm: SupportedAlgorithms.HS256 });
        
            setChatBotConfig({
                jwt: jwtToken,
                threadId: `${activeCompanyUniqueName}${userName}`,
                variables: {
                    env: 'prod',
                    session: session ?? '',
                    activeCompanyUniqueName: activeCompanyUniqueName ?? ''
                }
            })
        }
        setJWTPayload();

        const subscribe = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, setJWTPayload);

        return () => {
            subscribe.remove();
        }
    }, [])

    return (
        <></>
        // <ChatBot
        //     bridgeName="Assistant"
        //     embedToken={chatBotConfig.jwt}
        //     threadId={chatBotConfig.threadId}
        //     variables={chatBotConfig.variables}
        //     openInContainer={false}
        //     hideCloseButton={false}
        //     hideIcon={true}
        // />
    )
}

export default ChatBotSDK;