import random

commander_actions = ["Resource", "Logs", "Permissions", "Distributions"]
decritter_actions = ["Alpha", "Beta", "Gamma", "Crypting Sys", "Secret Code"]
detective_actions = ["Chat", "File", "Restricted File", "History Reconstruction"]

solutions_senders = ["Protocols", "DB Backup", "Deduction"]

for i in range(60):

    combination : list[str] = []
    combination.append(commander_actions[random.randint(0, commander_actions.__len__()-1)])
    combination.append(decritter_actions[random.randint(0, decritter_actions.__len__()-1)])
    combination.append(detective_actions[random.randint(0, detective_actions.__len__()-1)])

    if "Restricted File" in combination and "Permissions" not in combination:
        combination.append("Permissions")
    if "Permissions" in combination and "Restricted File" not in combination:
        combination.append("Restricted File")

    combination.append(solutions_senders[random.randint(0, 2)])

    print(combination)