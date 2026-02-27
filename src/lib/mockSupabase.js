import { mockData } from './mockData';

let currentUser = null;
let authListeners = [];

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockSupabase = {
  auth: {
    async signInWithPassword({ email, password }) {
      await delay(500);

      const user = mockData.users.find(u => u.email === email);

      if (!user || password !== 'demo123') {
        throw new Error('Invalid login credentials');
      }

      currentUser = user;

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

    async signOut() {
      await delay(200);
      const prevUser = currentUser;
      currentUser = null;

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
        return {
          async eq(column, value) {
            await delay(200);
            const data = mockData[tableName] || [];
            const filtered = data.filter(item => item[column] === value);
            return {
              data: filtered,
              error: null,
              maybeSingle() {
                return {
                  data: filtered[0] || null,
                  error: null
                };
              },
              single() {
                return {
                  data: filtered[0] || null,
                  error: filtered.length === 0 ? new Error('No rows found') : null
                };
              }
            };
          },
          order(column, options = {}) {
            return {
              async then(resolve) {
                await delay(200);
                let data = [...(mockData[tableName] || [])];
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
          async then(resolve) {
            await delay(200);
            const data = mockData[tableName] || [];
            resolve({ data, error: null });
          }
        };
      },

      async insert(data) {
        await delay(300);
        const newItem = {
          ...data,
          id: data.id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: data.created_at || new Date().toISOString()
        };

        if (!mockData[tableName]) {
          mockData[tableName] = [];
        }
        mockData[tableName].push(newItem);

        return {
          select() {
            return {
              single() {
                return {
                  data: newItem,
                  error: null
                };
              }
            };
          },
          data: newItem,
          error: null
        };
      },

      update(data) {
        return {
          async eq(column, value) {
            await delay(300);
            const items = mockData[tableName] || [];
            const index = items.findIndex(item => item[column] === value);

            if (index >= 0) {
              items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
              return {
                select() {
                  return {
                    single() {
                      return {
                        data: items[index],
                        error: null
                      };
                    }
                  };
                },
                data: items[index],
                error: null
              };
            }

            return {
              select() {
                return {
                  single() {
                    return {
                      data: null,
                      error: new Error('No rows updated')
                    };
                  }
                };
              },
              data: null,
              error: new Error('No rows updated')
            };
          }
        };
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
  }
};
