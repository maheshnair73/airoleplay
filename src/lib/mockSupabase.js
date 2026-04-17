import { mockData } from './mockData';

const STORAGE_KEY = 'mock-supabase-user';

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

let currentUser = getStoredUser();
let authListeners = [];

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockSupabase = {
  isMockClient: true,

  auth: {
    async signInWithPassword({ email, password }) {
      await delay(500);

      const user = mockData.users.find(u => u.email === email);

      if (!user || password !== 'demo123') {
        throw new Error('Invalid login credentials');
      }

      currentUser = user;
      setStoredUser(user);

      const session = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        access_token: 'mock-token-' + user.id,
        refresh_token: 'mock-refresh-token'
      };

      authListeners.forEach(listener => {
        listener('SIGNED_IN', session);
      });

      return { data: session, error: null };
    },

    async signUp({ email, password, options }) {
      await delay(400);
      const existing = mockData.users?.find(u => u.email === email);
      if (existing) {
        return { data: { user: null }, error: new Error('User already registered') };
      }
      const newUser = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        full_name: options?.data?.full_name || '',
        role: 'sales_agent',
        created_at: new Date().toISOString(),
      };
      if (!mockData.users) mockData.users = [];
      mockData.users.push(newUser);
      return { data: { user: newUser }, error: null };
    },

    async signOut() {
      await delay(200);
      const prevUser = currentUser;
      currentUser = null;
      setStoredUser(null);

      authListeners.forEach(listener => {
        listener('SIGNED_OUT', null);
      });

      return { error: null };
    },

    async getSession() {
      await delay(100);
      if (currentUser) {
        return {
          data: {
            session: {
              user: {
                id: currentUser.id,
                email: currentUser.email,
                role: currentUser.role
              },
              access_token: 'mock-token-' + currentUser.id
            }
          },
          error: null
        };
      }
      return { data: { session: null }, error: null };
    },

    async getUser() {
      await delay(100);
      if (currentUser) {
        return {
          data: {
            user: {
              id: currentUser.id,
              email: currentUser.email,
              role: currentUser.role
            }
          },
          error: null
        };
      }
      return { data: { user: null }, error: null };
    },

    onAuthStateChange(callback) {
      authListeners.push(callback);

      if (currentUser) {
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: currentUser.id,
              email: currentUser.email,
              role: currentUser.role
            },
            access_token: 'mock-token-' + currentUser.id
          });
        }, 0);
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners = authListeners.filter(l => l !== callback);
            }
          }
        }
      };
    }
  },

  from(tableName) {
    return {
      select(columns = '*') {
        const filters = [];

        const createChainableQuery = (currentData) => {
          return {
            eq(column, value) {
              filters.push({ column, value });
              return createChainableQuery(currentData);
            },
            order(column, options = {}) {
              return {
                async then(resolve) {
                  await delay(200);
                  let data = [...(mockData[tableName] || [])];

                  filters.forEach(filter => {
                    data = data.filter(item => item[filter.column] === filter.value);
                  });

                  data.sort((a, b) => {
                    if (options.ascending === false) {
                      return b[column] > a[column] ? 1 : -1;
                    }
                    return a[column] > b[column] ? 1 : -1;
                  });
                  resolve({ data, error: null });
                }
              };
            },
            maybeSingle() {
              return (async () => {
                await delay(200);
                let data = [...(mockData[tableName] || [])];

                filters.forEach(filter => {
                  data = data.filter(item => item[filter.column] === filter.value);
                });

                return {
                  data: data[0] || null,
                  error: null
                };
              })();
            },
            single() {
              return (async () => {
                await delay(200);
                let data = [...(mockData[tableName] || [])];

                filters.forEach(filter => {
                  data = data.filter(item => item[filter.column] === filter.value);
                });

                return {
                  data: data[0] || null,
                  error: data.length === 0 ? new Error('No rows found') : null
                };
              })();
            },
            then(resolve) {
              return (async () => {
                await delay(200);
                let data = [...(mockData[tableName] || [])];
                filters.forEach(filter => {
                  data = data.filter(item => item[filter.column] === filter.value);
                });
                return { data, error: null };
              })().then(resolve);
            }
          };
        };

        return createChainableQuery(mockData[tableName] || []);
      },

      insert(insertData) {
        const items = Array.isArray(insertData) ? insertData : [insertData];
        const newItems = items.map(item => ({
          ...item,
          id: item.id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: item.created_at || new Date().toISOString()
        }));

        if (!mockData[tableName]) {
          mockData[tableName] = [];
        }
        mockData[tableName].push(...newItems);

        const returnItem = newItems.length === 1 ? newItems[0] : newItems;

        const result = Promise.resolve({ data: returnItem, error: null });
        result.select = () => ({
          single: () => Promise.resolve({ data: returnItem, error: null }),
          maybeSingle: () => Promise.resolve({ data: returnItem, error: null }),
          then: (resolve) => { resolve({ data: returnItem, error: null }); },
        });

        return result;
      },

      update(updateData) {
        const filters = [];
        const chain = {
          eq(column, value) {
            filters.push({ column, value });
            return chain;
          },
          then(resolve) {
            (async () => {
              await delay(300);
              const items = mockData[tableName] || [];
              let updated = null;
              items.forEach((item, index) => {
                const match = filters.every(f => item[f.column] === f.value);
                if (match) {
                  items[index] = { ...item, ...updateData, updated_at: new Date().toISOString() };
                  updated = items[index];
                }
              });
              resolve({ data: updated, error: null });
            })();
          },
          select() {
            return {
              single: () => chain,
              then: chain.then,
            };
          }
        };
        return chain;
      },

      async upsert(data) {
        await delay(300);
        const items = Array.isArray(data) ? data : [data];
        if (!mockData[tableName]) mockData[tableName] = [];
        items.forEach(item => {
          const idx = item.id ? mockData[tableName].findIndex(r => r.id === item.id) : -1;
          if (idx >= 0) {
            mockData[tableName][idx] = { ...mockData[tableName][idx], ...item, updated_at: new Date().toISOString() };
          } else {
            mockData[tableName].push({ ...item, id: item.id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString() });
          }
        });
        return { data: items.length === 1 ? items[0] : items, error: null };
      },

      delete() {
        return {
          async eq(column, value) {
            await delay(200);
            const items = mockData[tableName] || [];
            const index = items.findIndex(item => item[column] === value);

            if (index >= 0) {
              items.splice(index, 1);
              return { error: null };
            }

            return { error: new Error('No rows deleted') };
          }
        };
      }
    };
  },

  functions: {
    async invoke(functionName, options = {}) {
      await delay(500);

      if (functionName === 'ai-roleplay') {
        const { userText, prospect, transcriptHistory } = options.body || {};

        const mockResponses = [
          "That's interesting. Can you tell me more about how this would impact your team?",
          "I appreciate that perspective. What are your main concerns about implementation?",
          "Great question. Let me share how other clients have approached this.",
          "I understand. What would success look like for you in this initiative?",
          "Absolutely. Our solution is designed to address exactly that challenge."
        ];

        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

        return {
          data: {
            text: userText === null ? `Hello! I'm ${prospect.name}, ${prospect.title} at ${prospect.company_name}. How can I help you today?` : randomResponse,
            audio: null,
            fallback_mode: false
          },
          error: null
        };
      }

      return {
        data: { success: true, message: `Mock response for ${functionName}` },
        error: null
      };
    }
  }
};
