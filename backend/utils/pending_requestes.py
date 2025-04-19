

class PendingRequestCache:

    def __init__(self) -> None:
        
        self.pending_requests : dict[int, list[any]] = {}
