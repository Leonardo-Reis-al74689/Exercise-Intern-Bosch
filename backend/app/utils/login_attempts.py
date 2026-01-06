from datetime import datetime, timedelta
from typing import Dict

class LoginAttemptTracker:
    def __init__(self):
        self._attempts: Dict[str, list] = {}
        self._blocked: Dict[str, datetime] = {}
    
    def is_blocked(self, username: str) -> bool:
        if username in self._blocked:
            if datetime.utcnow() < self._blocked[username]:
                return True
            else:
                del self._blocked[username]
                if username in self._attempts:
                    del self._attempts[username]
        return False
    
    def record_failed_attempt(self, username: str) -> None:
        now = datetime.utcnow()
        
        if username not in self._attempts:
            self._attempts[username] = []
        
        self._attempts[username] = [
            attempt for attempt in self._attempts[username]
            if now - attempt < timedelta(minutes=15)
        ]
        
        self._attempts[username].append(now)
        
        if len(self._attempts[username]) >= 5:
            self._blocked[username] = now + timedelta(minutes=15)
    
    def record_successful_login(self, username: str) -> None:
        if username in self._attempts:
            del self._attempts[username]
        if username in self._blocked:
            del self._blocked[username]
    
    def get_remaining_attempts(self, username: str) -> int:
        if username not in self._attempts:
            return 5
        
        now = datetime.utcnow()
        recent_attempts = [
            attempt for attempt in self._attempts[username]
            if now - attempt < timedelta(minutes=15)
        ]
        
        return max(0, 5 - len(recent_attempts))
    
    def get_block_time_remaining(self, username: str) -> int:
        if username in self._blocked:
            remaining = (self._blocked[username] - datetime.utcnow()).total_seconds()
            return max(0, int(remaining / 60))
        return 0

login_tracker = LoginAttemptTracker()

