import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  Clock,
  TrendingUp,
  Trophy,
  CheckCircle,
  PlayCircle,
  RotateCcw,
  Search,
  Filter,
  Download,
  Calendar,
  Target,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function CertifyHub() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCertifications: 0,
    activeCertifications: 0,
    averageScore: 0,
    completionRate: 0
  });
  const [availableTests, setAvailableTests] = useState([]);
  const [myCertifications, setMyCertifications] = useState([]);
  const [inProgressTests, setInProgressTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tests, error: testsError } = await supabase
        .from('certification_tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data: certifications, error: certsError } = await supabase
        .from('user_certifications')
        .select(`
          *,
          certification_tests (
            name,
            description,
            badge_icon,
            badge_color
          )
        `)
        .eq('user_id', user.id)
        .order('issued_date', { ascending: false });

      const { data: attempts, error: attemptsError } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'in_progress');

      // Use mock data if database tables don't exist yet
      const mockTests = [
        {
          id: '1',
          name: 'Sales Fundamentals Certification',
          description: 'Master the core principles of modern sales, including prospecting, qualification, and closing techniques.',
          category: 'Sales Skills',
          difficulty_level: 'Beginner',
          passing_score: 70,
          time_limit_minutes: 30,
          badge_icon: 'Award',
          badge_color: 'blue',
          is_active: true,
          question_count: 20
        },
        {
          id: '2',
          name: 'Product Knowledge Expert',
          description: 'Comprehensive certification covering all product features, use cases, and competitive positioning.',
          category: 'Product Knowledge',
          difficulty_level: 'Intermediate',
          passing_score: 80,
          time_limit_minutes: 45,
          badge_icon: 'Trophy',
          badge_color: 'purple',
          is_active: true,
          question_count: 30
        },
        {
          id: '3',
          name: 'Advanced Negotiation Tactics',
          description: 'Learn advanced negotiation strategies, objection handling, and deal structuring for complex sales.',
          category: 'Sales Skills',
          difficulty_level: 'Advanced',
          passing_score: 85,
          time_limit_minutes: 60,
          badge_icon: 'Star',
          badge_color: 'gold',
          is_active: true,
          question_count: 25
        },
        {
          id: '4',
          name: 'Customer Success Certification',
          description: 'Certification in customer onboarding, retention strategies, and driving product adoption.',
          category: 'Customer Success',
          difficulty_level: 'Intermediate',
          passing_score: 75,
          time_limit_minutes: 40,
          badge_icon: 'CheckCircle',
          badge_color: 'green',
          is_active: true,
          question_count: 22
        },
        {
          id: '5',
          name: 'Sales Leadership Certification',
          description: 'Essential skills for sales managers: coaching, forecasting, pipeline management, and team development.',
          category: 'Leadership',
          difficulty_level: 'Advanced',
          passing_score: 80,
          time_limit_minutes: 50,
          badge_icon: 'Target',
          badge_color: 'orange',
          is_active: true,
          question_count: 28
        }
      ];

      const activeCerts = certifications?.filter(cert =>
        new Date(cert.valid_until) > new Date()
      ) || [];

      const totalScore = certifications?.reduce((sum, cert) => sum + (cert.score || 0), 0) || 0;
      const avgScore = certifications?.length > 0 ? totalScore / certifications.length : 0;

      setStats({
        totalCertifications: certifications?.length || 0,
        activeCertifications: activeCerts.length,
        averageScore: avgScore,
        completionRate: certifications?.length > 0 ? (activeCerts.length / certifications.length) * 100 : 0
      });

      setAvailableTests(tests || mockTests);
      setMyCertifications(certifications || []);
      setInProgressTests(attempts || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (testId) => {
    navigate(`/certification-test/${testId}`);
  };

  const resumeTest = (attemptId) => {
    navigate(`/certification-test/${attemptId}`);
  };

  const viewResults = (attemptId) => {
    navigate(`/certification-results/${attemptId}`);
  };

  const exportData = () => {
    toast.success('Export feature coming soon!');
  };

  const filteredTests = availableTests.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Certify Hub</h1>
          <p className="text-muted-foreground">
            Earn certifications and validate your expertise
          </p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Certifications</p>
                <p className="text-3xl font-bold">{stats.totalCertifications}</p>
              </div>
              <Award className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Certifications</p>
                <p className="text-3xl font-bold">{stats.activeCertifications}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="text-3xl font-bold">{stats.averageScore.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold">{stats.completionRate.toFixed(0)}%</p>
              </div>
              <Target className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">
            Available Tests ({filteredTests.length})
          </TabsTrigger>
          <TabsTrigger value="my-certifications">
            My Certifications ({myCertifications.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressTests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {test.time_limit_minutes} min
                    </Badge>
                    <Badge variant="outline">
                      <Target className="mr-1 h-3 w-3" />
                      {test.passing_score}% to pass
                    </Badge>
                    {test.difficulty && (
                      <Badge variant="secondary">{test.difficulty}</Badge>
                    )}
                  </div>

                  <Button onClick={() => startTest(test.id)} className="w-full">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}

            {filteredTests.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certifications available</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-certifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCertifications.map((cert) => {
              const isExpired = new Date(cert.valid_until) < new Date();
              return (
                <Card key={cert.id} className={isExpired ? 'opacity-60' : 'border-green-500'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {cert.certification_tests?.name || 'Certification'}
                        </CardTitle>
                        <CardDescription>
                          {cert.certification_tests?.description}
                        </CardDescription>
                      </div>
                      {!isExpired && <CheckCircle className="h-8 w-8 text-green-500" />}
                      {isExpired && <Clock className="h-8 w-8 text-orange-500" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score:</span>
                      <Badge variant="secondary">{cert.score?.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Issued:</span>
                      <span className="text-sm">
                        {new Date(cert.issued_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valid Until:</span>
                      <span className={`text-sm ${isExpired ? 'text-red-500' : 'text-green-500'}`}>
                        {new Date(cert.valid_until).toLocaleDateString()}
                      </span>
                    </div>

                    {isExpired ? (
                      <Badge variant="destructive" className="w-full justify-center">
                        Expired
                      </Badge>
                    ) : (
                      <Badge className="w-full justify-center bg-green-500">
                        Active
                      </Badge>
                    )}

                    <Button
                      onClick={() => viewResults(cert.certification_attempt_id)}
                      variant="outline"
                      className="w-full"
                    >
                      View Certificate
                    </Button>
                  </CardContent>
                </Card>
              );
            })}

            {myCertifications.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No certifications earned yet</p>
                <Button onClick={() => document.querySelector('[value="available"]').click()}>
                  Browse Available Tests
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressTests.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">Test in Progress</CardTitle>
                      <CardDescription>
                        Started {new Date(attempt.started_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <RotateCcw className="h-8 w-8 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time Spent:</span>
                    <Badge variant="secondary">
                      {Math.floor((attempt.time_spent || 0) / 60)} min
                    </Badge>
                  </div>

                  <Button onClick={() => resumeTest(attempt.id)} className="w-full">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Resume Test
                  </Button>
                </CardContent>
              </Card>
            ))}

            {inProgressTests.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tests in progress</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
